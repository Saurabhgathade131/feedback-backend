import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Feedback from './models/Feedback';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Get all feedback
app.get('/api/feedback', async (req: Request, res: Response) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

// Post new feedback
app.post('/api/feedback', async (req: Request, res: Response) => {
    try {
        const { name, feedback, screen } = req.body;

        if (!name || !feedback) {
            return res.status(400).json({ message: 'Name and feedback text are required' });
        }

        const newFeedback = new Feedback({
            name,
            feedback,
            screen: screen || 'unknown',
            status: 'in-progress'
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        res.status(500).json({ message: 'Error saving feedback' });
    }
});

// Update feedback status
app.patch('/api/feedback/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['in-progress', 'incorporated'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json(updatedFeedback);
    } catch (error) {
        res.status(500).json({ message: 'Error updating feedback' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

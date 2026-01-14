import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import Feedback from './models/Feedback';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// 1. CORS Configuration (Max Compatibility)
app.use(cors({
    origin: true, // Echo back whatever origin is requesting (Framework Migration)
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// 2. Temporarily disable Helmet to ensure it's not blocking headers
// app.use(helmet({ ... }));

app.use(express.json());

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Feedback Backend is running' });
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Get all feedback
app.get('/api/feedback', async (req: Request, res: Response) => {
    console.log('GET /api/feedback request received');
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        console.log('Found feedback count:', feedback.length);
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            message: 'Error fetching feedback',
            error: error instanceof Error ? error.message : String(error)
        });
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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;

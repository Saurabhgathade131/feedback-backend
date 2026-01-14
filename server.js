import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure feedback.json exists
async function initStorage() {
    try {
        if (!await fs.pathExists(FEEDBACK_FILE)) {
            await fs.writeJson(FEEDBACK_FILE, []);
        }
    } catch (err) {
        console.error('Error initializing storage:', err);
    }
}

initStorage();

// Get all feedback
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await fs.readJson(FEEDBACK_FILE);
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read feedback' });
    }
});

// Post new feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, feedback, screen } = req.body;
        if (!name || !feedback) {
            return res.status(400).json({ error: 'Name and feedback are required' });
        }

        const newEntry = {
            id: uuidv4(),
            name,
            feedback,
            screen: screen || 'Unknown',
            status: 'in-progress',
            timestamp: new Date().toISOString()
        };

        const feedbackList = await fs.readJson(FEEDBACK_FILE);
        feedbackList.push(newEntry);
        await fs.writeJson(FEEDBACK_FILE, feedbackList, { spaces: 2 });

        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

// Update feedback status
app.patch('/api/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const feedbackList = await fs.readJson(FEEDBACK_FILE);
        const index = feedbackList.findIndex(f => f.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        feedbackList[index].status = status;
        await fs.writeJson(FEEDBACK_FILE, feedbackList, { spaces: 2 });

        res.json(feedbackList[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});

app.listen(PORT, () => {
    console.log(`Feedback server running on http://localhost:${PORT}`);
});

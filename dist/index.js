"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const Feedback_1 = __importDefault(require("./models/Feedback"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, db_1.default)();
// 1. CORS Configuration (Max Compatibility)
app.use((0, cors_1.default)({
    origin: true, // Echo back whatever origin is requesting (Framework Migration)
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
// 2. Temporarily disable Helmet to ensure it's not blocking headers
// app.use(helmet({ ... }));
app.use(express_1.default.json());
// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Feedback Backend is running' });
});
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
// Get all feedback
app.get('/api/feedback', async (req, res) => {
    console.log('GET /api/feedback request received');
    try {
        const feedback = await Feedback_1.default.find().sort({ createdAt: -1 });
        console.log('Found feedback count:', feedback.length);
        res.json(feedback);
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            message: 'Error fetching feedback',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// Post new feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, feedback, screen } = req.body;
        if (!name || !feedback) {
            return res.status(400).json({ message: 'Name and feedback text are required' });
        }
        const newFeedback = new Feedback_1.default({
            name,
            feedback,
            screen: screen || 'unknown',
            status: 'in-progress'
        });
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving feedback' });
    }
});
// Update feedback status
app.patch('/api/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['in-progress', 'incorporated'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const updatedFeedback = await Feedback_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.json(updatedFeedback);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating feedback' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;

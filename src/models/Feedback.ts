import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    name: string;
    text: string;
    category: string;
    status: 'pending' | 'reviewed' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    step: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    step: { type: String, default: 'unknown' },
}, {
    timestamps: true,
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);

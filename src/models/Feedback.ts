import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    name: string;
    feedback: string;
    screen: string;
    status: 'in-progress' | 'incorporated';
    timestamp: Date;
}

const FeedbackSchema: Schema = new Schema({
    name: { type: String, required: true },
    feedback: { type: String, required: true },
    screen: { type: String, default: 'General' },
    status: { type: String, enum: ['in-progress', 'incorporated'], default: 'in-progress' },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc: any, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            if (ret.createdAt) ret.timestamp = ret.createdAt;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);

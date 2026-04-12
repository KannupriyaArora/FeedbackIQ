import { Schema, model, Document } from 'mongoose';

export interface IFeedback extends Document {
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  category: string | null;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    rawText: { type: String, required: true },
    source: { type: String, enum: ['manual', 'csv'], required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', null],
      default: null,
    },
    category: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = model<IFeedback>('Feedback', FeedbackSchema);

import { Schema, model, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId: string;
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  category: string | null;
  summary: string | null;
  confidence: number | null;
  analyzedAt: Date | null;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: String, required: true, index: true },
    rawText: { type: String, required: true },
    source: { type: String, enum: ['manual', 'csv'], required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', null],
      default: null,
    },
    category: { type: String, default: null },
    summary: { type: String, default: null },
    confidence: { type: Number, default: null },
    analyzedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = model<IFeedback>('Feedback', FeedbackSchema);

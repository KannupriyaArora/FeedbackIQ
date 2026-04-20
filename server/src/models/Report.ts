import { randomBytes } from 'crypto';
import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  title: string;
  feedbackIds: Types.ObjectId[];
  slug: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true, trim: true },
    feedbackIds: [{ type: Schema.Types.ObjectId, ref: 'Feedback', default: [] }],
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export function generateSlug(): string {
  return randomBytes(6).toString('hex');
}

export const Report = model<IReport>('Report', ReportSchema);

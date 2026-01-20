import mongoose, { Document, Schema } from 'mongoose';

export interface IOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IPoll extends Document {
  question: string;
  options: IOption[];
  duration: number; // in seconds
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IOption>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true },
    duration: { type: Number, required: true, default: 60 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for querying active polls
PollSchema.index({ isActive: 1 });

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);

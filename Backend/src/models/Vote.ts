import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  optionId: string;
  studentId: string;
  studentName: string;
  votedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    votedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Compound index to ensure a student can only vote once per poll
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);

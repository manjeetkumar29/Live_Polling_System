import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  sessionId: string;
  name: string;
  socketId: string;
  isKicked: boolean;
  joinedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    socketId: { type: String, required: true },
    isKicked: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);

// Poll Types
export interface IOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PollResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
  isCorrect: boolean;
}

export interface Poll {
  _id: string;
  question: string;
  options: IOption[];
  duration: number;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  results: PollResult[];
  totalVotes: number;
  remainingTime: number;
}

// Student Types
export interface Student {
  _id: string;
  sessionId: string;
  name: string;
  socketId: string;
  isKicked: boolean;
  joinedAt: string;
}

// Chat Types
export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  content: string;
  createdAt: string;
}

// User Types
export type UserRole = 'teacher' | 'student' | null;

export interface User {
  role: UserRole;
  name: string;
  sessionId: string;
}

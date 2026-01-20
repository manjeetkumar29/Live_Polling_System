import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Poll, Student, Message } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;

  // Poll state
  currentPoll: Poll | null;
  setCurrentPoll: (poll: Poll | null) => void;
  pollHistory: Poll[];
  setPollHistory: (polls: Poll[]) => void;
  hasVoted: boolean;
  setHasVoted: (hasVoted: boolean) => void;

  // Timer state
  remainingTime: number;
  setRemainingTime: (time: number) => void;

  // Students state
  students: Student[];
  setStudents: (students: Student[]) => void;

  // Chat state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;

  // Connection state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Kicked state
  isKicked: boolean;
  setIsKicked: (kicked: boolean) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  user: null,
  currentPoll: null,
  pollHistory: [],
  hasVoted: false,
  remainingTime: 0,
  students: [],
  messages: [],
  isChatOpen: false,
  isConnected: false,
  isKicked: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // User actions
      setUser: (user) => set({ user }),
      setUserRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
      setUserName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        })),

      // Poll actions
      setCurrentPoll: (poll) => set({ currentPoll: poll }),
      setPollHistory: (polls) => set({ pollHistory: polls }),
      setHasVoted: (hasVoted) => set({ hasVoted }),

      // Timer actions
      setRemainingTime: (time) => set({ remainingTime: time }),

      // Students actions
      setStudents: (students) => set({ students }),

      // Chat actions
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

      // Connection actions
      setIsConnected: (connected) => set({ isConnected: connected }),

      // Kicked actions
      setIsKicked: (kicked) => set({ isKicked: kicked }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'polling-app-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

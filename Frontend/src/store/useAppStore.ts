import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Poll, Student, Message } from '../types';

interface AppState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  user: User | null;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;

  currentPoll: Poll | null;
  setCurrentPoll: (poll: Poll | null) => void;
  pollHistory: Poll[];
  setPollHistory: (polls: Poll[]) => void;
  hasVoted: boolean;
  setHasVoted: (hasVoted: boolean) => void;

  remainingTime: number;
  setRemainingTime: (time: number) => void;

  students: Student[];
  setStudents: (students: Student[]) => void;

  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;

  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  isKicked: boolean;
  setIsKicked: (kicked: boolean) => void;

  reset: () => void;
}

const initialState = {
  _hasHydrated: false,
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

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setUser: (user) => set({ user }),
      setUserRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
      setUserName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        })),

      setCurrentPoll: (poll) => set({ currentPoll: poll }),
      setPollHistory: (polls) => set({ pollHistory: polls }),
      setHasVoted: (hasVoted) => set({ hasVoted }),

      setRemainingTime: (time) => set({ remainingTime: time }),

      setStudents: (students) => set({ students }),

      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

      setIsConnected: (connected) => set({ isConnected: connected }),

      setIsKicked: (kicked) => set({ isKicked: kicked }),

      reset: () => set(initialState),
    }),
    {
      name: 'polling-app-storage',
      partialize: (state) => ({
        user: state.user,
        currentPoll: state.currentPoll,
        hasVoted: state.hasVoted,
        remainingTime: state.remainingTime,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

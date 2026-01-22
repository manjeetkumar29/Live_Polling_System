import { useCallback } from "react";
import { socketService } from "../services";
import { useAppStore } from "../store";
import type { Poll, Message } from "../types";

export const useSocket = () => {
  const { user, setCurrentPoll, setRemainingTime, setHasVoted } = useAppStore();

  const registerStudent = useCallback(
    (sessionId: string, name: string) => {
      return new Promise<{
        success: boolean;
        hasVoted?: boolean;
        message?: string;
      }>((resolve) => {
        socketService.emit(
          "student:register",
          { sessionId, name },
          (response: any) => {
            if (response.success && response.activePoll) {
              setCurrentPoll(response.activePoll);
              setRemainingTime(response.activePoll.remainingTime);
              setHasVoted(response.hasVoted);
            }
            resolve(response);
          },
        );
      });
    },
    [setCurrentPoll, setRemainingTime, setHasVoted],
  );

  const createPoll = useCallback(
    (
      question: string,
      options: { id: string; text: string; isCorrect: boolean }[],
      duration: number,
    ) => {
      return new Promise<{ success: boolean; poll?: Poll; message?: string }>(
        (resolve) => {
          socketService.emit(
            "poll:create",
            { question, options, duration },
            (response: any) => {
              resolve(response);
            },
          );
        },
      );
    },
    [],
  );

  const submitVote = useCallback(
    (pollId: string, optionId: string) => {
      return new Promise<{ success: boolean; message?: string }>((resolve) => {
        socketService.emit(
          "vote:submit",
          {
            pollId,
            optionId,
            studentId: user?.sessionId,
            studentName: user?.name,
          },
          (response: any) => {
            if (response.success) {
              setHasVoted(true);
            }
            resolve(response);
          },
        );
      });
    },
    [user, setHasVoted],
  );

  const getPollHistory = useCallback(() => {
    return new Promise<{ success: boolean; polls?: Poll[]; message?: string }>(
      (resolve) => {
        console.log("[useSocket.getPollHistory] Emitting poll:history event");
        socketService.emit("poll:history", null, (response: any) => {
          console.log(
            "[useSocket.getPollHistory] Received response:",
            response,
          );
          resolve(response);
        });
      },
    );
  }, []);

  const kickStudent = useCallback((sessionId: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      socketService.emit("student:kick", { sessionId }, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      return new Promise<{ success: boolean; message?: Message }>((resolve) => {
        socketService.emit(
          "chat:send",
          {
            senderId: user?.sessionId,
            senderName: user?.name || "Teacher",
            senderRole: user?.role,
            content,
          },
          (response: any) => {
            resolve(response);
          },
        );
      });
    },
    [user],
  );

  const getCurrentPoll = useCallback(() => {
    return new Promise<{ success: boolean; poll?: Poll; hasVoted?: boolean }>(
      (resolve) => {
        socketService.emit(
          "poll:getCurrent",
          { studentId: user?.sessionId },
          (response: any) => {
            if (response.success && response.poll) {
              setCurrentPoll(response.poll);
              setRemainingTime(response.poll.remainingTime);
              setHasVoted(response.hasVoted);
            }
            resolve(response);
          },
        );
      },
    );
  }, [user, setCurrentPoll, setRemainingTime, setHasVoted]);

  return {
    registerStudent,
    createPoll,
    submitVote,
    getPollHistory,
    kickStudent,
    sendMessage,
    getCurrentPoll,
  };
};

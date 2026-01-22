import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { socketService } from "../services";
import { useAppStore } from "../store";
import type { Poll, Student, Message } from "../types";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ isConnected: false });

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    user,
    setCurrentPoll,
    setStudents,
    setMessages,
    addMessage,
    setRemainingTime,
    setIsConnected,
    setIsKicked,
    setHasVoted,
    isConnected,
  } = useAppStore();

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => {
      setIsConnected(true);

      const currentUser = useAppStore.getState().user;
      if (currentUser?.sessionId && currentUser?.role === "student") {
        socketService.emit(
          "student:register",
          { sessionId: currentUser.sessionId, name: currentUser.name },
          (response: any) => {
            if (response.success) {
              if (response.activePoll) {
                setCurrentPoll(response.activePoll);
                setRemainingTime(response.activePoll.remainingTime);
              }
              setHasVoted(response.hasVoted || false);
            }
          },
        );
      } else {
        socketService.emit(
          "poll:getCurrent",
          { studentId: currentUser?.sessionId },
          (response: any) => {
            if (response.success && response.poll) {
              setCurrentPoll(response.poll);
              setRemainingTime(response.poll.remainingTime);
            }
          },
        );
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handlePollCurrent = (poll: Poll) => {
      setCurrentPoll(poll);
      setRemainingTime(poll.remainingTime);
    };

    const handlePollNew = (poll: Poll) => {
      setCurrentPoll(poll);
      setRemainingTime(poll.remainingTime);
      setHasVoted(false);
    };

    const handlePollResults = (poll: Poll) => {
      setCurrentPoll(poll);
    };

    const handlePollEnded = (poll: Poll) => {
      setCurrentPoll(poll);
      setRemainingTime(0);
    };

    const handleTimerUpdate = ({
      remainingTime,
    }: {
      pollId: string;
      remainingTime: number;
    }) => {
      setRemainingTime(remainingTime);
    };

    const handleStudentsList = (students: Student[]) => {
      setStudents(students);
    };

    const handleStudentKicked = () => {
      setIsKicked(true);
    };

    const handleChatHistory = (messages: Message[]) => {
      setMessages(messages);
    };

    const handleChatMessage = (message: Message) => {
      addMessage(message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("poll:current", handlePollCurrent);
    socket.on("poll:new", handlePollNew);
    socket.on("poll:results", handlePollResults);
    socket.on("poll:ended", handlePollEnded);
    socket.on("timer:update", handleTimerUpdate);
    socket.on("students:list", handleStudentsList);
    socket.on("student:kicked", handleStudentKicked);
    socket.on("chat:history", handleChatHistory);
    socket.on("chat:message", handleChatMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("poll:current", handlePollCurrent);
      socket.off("poll:new", handlePollNew);
      socket.off("poll:results", handlePollResults);
      socket.off("poll:ended", handlePollEnded);
      socket.off("timer:update", handleTimerUpdate);
      socket.off("students:list", handleStudentsList);
      socket.off("student:kicked", handleStudentKicked);
      socket.off("chat:history", handleChatHistory);
      socket.off("chat:message", handleChatMessage);
    };
  }, [
    user,
    setCurrentPoll,
    setStudents,
    setMessages,
    addMessage,
    setRemainingTime,
    setIsConnected,
    setIsKicked,
    setHasVoted,
  ]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

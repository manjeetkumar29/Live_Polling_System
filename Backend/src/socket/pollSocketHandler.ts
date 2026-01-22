import { Server, Socket } from "socket.io";
import {
  pollService,
  voteService,
  studentService,
  chatService,
} from "../services";
import { IOption } from "../models";

let pollTimerInterval: NodeJS.Timeout | null = null;

interface CreatePollPayload {
  question: string;
  options: IOption[];
  duration: number;
}

interface SubmitVotePayload {
  pollId: string;
  optionId: string;
  studentId: string;
  studentName: string;
}

interface RegisterStudentPayload {
  sessionId: string;
  name: string;
}

interface ChatMessagePayload {
  senderId: string;
  senderName: string;
  senderRole: "teacher" | "student";
  content: string;
}

interface KickStudentPayload {
  sessionId: string;
}

export const setupSocketHandlers = (io: Server) => {
  const startPollTimer = async (
    pollId: string,
    duration: number,
    startedAt: Date,
  ) => {
    if (pollTimerInterval) {
      clearInterval(pollTimerInterval);
    }

    const endTime = new Date(startedAt.getTime() + duration * 1000);

    pollTimerInterval = setInterval(async () => {
      const now = new Date();
      const remainingTime = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000),
      );

      io.emit("timer:update", { pollId, remainingTime });

      if (remainingTime <= 0) {
        if (pollTimerInterval) {
          clearInterval(pollTimerInterval);
          pollTimerInterval = null;
        }

        await pollService.endPoll(pollId);
        const pollWithResults = await pollService.getPollWithResults(pollId);
        io.emit("poll:ended", pollWithResults);
      }
    }, 1000);
  };

  io.on("connection", async (socket: Socket) => {
    console.log("Client connected:", socket.id);

    const sendCurrentState = async () => {
      const latestPoll = await pollService.getLatestPollWithResults();
      if (latestPoll) {
        socket.emit("poll:current", latestPoll);
      }

      const students = await studentService.getAllActiveStudents();
      socket.emit("students:list", students);

      const messages = await chatService.getRecentMessages();
      socket.emit("chat:history", messages);
    };

    await sendCurrentState();

    socket.on("poll:create", async (payload: CreatePollPayload, callback) => {
      try {
        const poll = await pollService.createPoll(payload);
        const pollWithResults = await pollService.getPollWithResults(
          poll._id.toString(),
        );

        startPollTimer(poll._id.toString(), payload.duration, poll.startedAt);

        io.emit("poll:new", pollWithResults);

        callback?.({ success: true, poll: pollWithResults });
      } catch (error: any) {
        console.error("Error creating poll:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("poll:history", async (payload, callback) => {
      try {
        console.log("[poll:history] Request received from socket:", socket.id);
        const history = await pollService.getPollHistory();
        console.log("[poll:history] Found", history.length, "polls in history");
        callback?.({ success: true, polls: history });
      } catch (error: any) {
        console.error("[poll:history] Error fetching poll history:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("student:kick", async (payload: KickStudentPayload, callback) => {
      try {
        const student = await studentService.kickStudent(payload.sessionId);
        if (student) {
          io.to(student.socketId).emit("student:kicked");

          const students = await studentService.getAllActiveStudents();
          io.emit("students:list", students);

          callback?.({ success: true });
        } else {
          callback?.({ success: false, message: "Student not found" });
        }
      } catch (error: any) {
        console.error("Error kicking student:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on(
      "student:register",
      async (payload: RegisterStudentPayload, callback) => {
        try {
          const student = await studentService.registerStudent({
            ...payload,
            socketId: socket.id,
          });

          const activePoll = await pollService.getActivePollWithResults();

          let hasVoted = false;
          if (activePoll) {
            hasVoted = await voteService.hasStudentVoted(
              activePoll._id,
              payload.sessionId,
            );
          }

          const students = await studentService.getAllActiveStudents();
          io.emit("students:list", students);

          callback?.({
            success: true,
            student,
            activePoll,
            hasVoted,
          });
        } catch (error: any) {
          console.error("Error registering student:", error);
          callback?.({ success: false, message: error.message });
        }
      },
    );

    socket.on("vote:submit", async (payload: SubmitVotePayload, callback) => {
      try {
        const result = await voteService.submitVote(payload);

        if (result.success) {
          const pollWithResults = await pollService.getPollWithResults(
            payload.pollId,
          );

          io.emit("poll:results", pollWithResults);

          callback?.({ success: true });
        } else {
          callback?.({ success: false, message: result.message });
        }
      } catch (error: any) {
        console.error("Error submitting vote:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on(
      "vote:check",
      async (payload: { pollId: string; studentId: string }, callback) => {
        try {
          const hasVoted = await voteService.hasStudentVoted(
            payload.pollId,
            payload.studentId,
          );
          callback?.({ success: true, hasVoted });
        } catch (error: any) {
          console.error("Error checking vote:", error);
          callback?.({ success: false, message: error.message });
        }
      },
    );

    socket.on("chat:send", async (payload: ChatMessagePayload, callback) => {
      try {
        const message = await chatService.sendMessage(payload);

        io.emit("chat:message", message);

        callback?.({ success: true, message });
      } catch (error: any) {
        console.error("Error sending message:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on(
      "poll:getCurrent",
      async (payload: { studentId?: string }, callback) => {
        try {
          const latestPoll = await pollService.getLatestPollWithResults();

          let hasVoted = false;
          if (latestPoll && payload.studentId) {
            hasVoted = await voteService.hasStudentVoted(
              latestPoll._id,
              payload.studentId,
            );
          }

          callback?.({ success: true, poll: latestPoll, hasVoted });
        } catch (error: any) {
          console.error("Error getting current poll:", error);
          callback?.({ success: false, message: error.message });
        }
      },
    );

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const restoreActivePolLTimer = async () => {
    const activePoll = await pollService.getActivePoll();
    if (activePoll && !pollService.isPollExpired(activePoll)) {
      startPollTimer(
        activePoll._id.toString(),
        activePoll.duration,
        activePoll.startedAt,
      );
    } else if (activePoll) {
      await pollService.endPoll(activePoll._id.toString());
    }
  };

  restoreActivePolLTimer();
};

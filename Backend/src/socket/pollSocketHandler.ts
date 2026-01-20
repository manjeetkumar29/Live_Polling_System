import { Server, Socket } from 'socket.io';
import { pollService, voteService, studentService, chatService } from '../services';
import { IOption } from '../models';

// Store active poll timer
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
  senderRole: 'teacher' | 'student';
  content: string;
}

interface KickStudentPayload {
  sessionId: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Start poll timer broadcast
  const startPollTimer = async (pollId: string, duration: number, startedAt: Date) => {
    // Clear any existing timer
    if (pollTimerInterval) {
      clearInterval(pollTimerInterval);
    }

    const endTime = new Date(startedAt.getTime() + duration * 1000);

    pollTimerInterval = setInterval(async () => {
      const now = new Date();
      const remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

      io.emit('timer:update', { pollId, remainingTime });

      if (remainingTime <= 0) {
        if (pollTimerInterval) {
          clearInterval(pollTimerInterval);
          pollTimerInterval = null;
        }

        // End the poll
        await pollService.endPoll(pollId);
        const pollWithResults = await pollService.getPollWithResults(pollId);
        io.emit('poll:ended', pollWithResults);
      }
    }, 1000);
  };

  io.on('connection', async (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Send current state on connection
    const sendCurrentState = async () => {
      const activePoll = await pollService.getActivePollWithResults();
      if (activePoll) {
        socket.emit('poll:current', activePoll);
      }

      const students = await studentService.getAllActiveStudents();
      socket.emit('students:list', students);

      const messages = await chatService.getRecentMessages();
      socket.emit('chat:history', messages);
    };

    await sendCurrentState();

    // ==================== TEACHER EVENTS ====================

    // Create a new poll
    socket.on('poll:create', async (payload: CreatePollPayload, callback) => {
      try {
        const poll = await pollService.createPoll(payload);
        const pollWithResults = await pollService.getPollWithResults(poll._id.toString());

        // Start the timer
        startPollTimer(poll._id.toString(), payload.duration, poll.startedAt);

        // Broadcast to all clients
        io.emit('poll:new', pollWithResults);

        callback?.({ success: true, poll: pollWithResults });
      } catch (error: any) {
        console.error('Error creating poll:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // Get poll history
    socket.on('poll:history', async (callback) => {
      try {
        const history = await pollService.getPollHistory();
        callback?.({ success: true, polls: history });
      } catch (error: any) {
        console.error('Error fetching poll history:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // Kick a student
    socket.on('student:kick', async (payload: KickStudentPayload, callback) => {
      try {
        const student = await studentService.kickStudent(payload.sessionId);
        if (student) {
          // Notify the kicked student
          io.to(student.socketId).emit('student:kicked');
          
          // Update student list for all clients
          const students = await studentService.getAllActiveStudents();
          io.emit('students:list', students);

          callback?.({ success: true });
        } else {
          callback?.({ success: false, message: 'Student not found' });
        }
      } catch (error: any) {
        console.error('Error kicking student:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // ==================== STUDENT EVENTS ====================

    // Register student
    socket.on('student:register', async (payload: RegisterStudentPayload, callback) => {
      try {
        const student = await studentService.registerStudent({
          ...payload,
          socketId: socket.id
        });

        // Check if there's an active poll
        const activePoll = await pollService.getActivePollWithResults();
        
        // Check if student has already voted
        let hasVoted = false;
        if (activePoll) {
          hasVoted = await voteService.hasStudentVoted(activePoll._id, payload.sessionId);
        }

        // Update student list for all clients
        const students = await studentService.getAllActiveStudents();
        io.emit('students:list', students);

        callback?.({ 
          success: true, 
          student,
          activePoll,
          hasVoted
        });
      } catch (error: any) {
        console.error('Error registering student:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // Submit vote
    socket.on('vote:submit', async (payload: SubmitVotePayload, callback) => {
      try {
        const result = await voteService.submitVote(payload);

        if (result.success) {
          // Get updated poll results
          const pollWithResults = await pollService.getPollWithResults(payload.pollId);
          
          // Broadcast updated results to all clients
          io.emit('poll:results', pollWithResults);

          callback?.({ success: true });
        } else {
          callback?.({ success: false, message: result.message });
        }
      } catch (error: any) {
        console.error('Error submitting vote:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // Check vote status
    socket.on('vote:check', async (payload: { pollId: string; studentId: string }, callback) => {
      try {
        const hasVoted = await voteService.hasStudentVoted(payload.pollId, payload.studentId);
        callback?.({ success: true, hasVoted });
      } catch (error: any) {
        console.error('Error checking vote:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // ==================== CHAT EVENTS ====================

    // Send chat message
    socket.on('chat:send', async (payload: ChatMessagePayload, callback) => {
      try {
        const message = await chatService.sendMessage(payload);
        
        // Broadcast to all clients
        io.emit('chat:message', message);

        callback?.({ success: true, message });
      } catch (error: any) {
        console.error('Error sending message:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // ==================== COMMON EVENTS ====================

    // Get current poll state (for page refresh recovery)
    socket.on('poll:getCurrent', async (payload: { studentId?: string }, callback) => {
      try {
        const activePoll = await pollService.getActivePollWithResults();
        
        let hasVoted = false;
        if (activePoll && payload.studentId) {
          hasVoted = await voteService.hasStudentVoted(activePoll._id, payload.studentId);
        }

        callback?.({ success: true, poll: activePoll, hasVoted });
      } catch (error: any) {
        console.error('Error getting current poll:', error);
        callback?.({ success: false, message: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      // Optionally update student's online status here
    });
  });

  // Restore timer for active poll on server restart
  const restoreActivePolLTimer = async () => {
    const activePoll = await pollService.getActivePoll();
    if (activePoll && !pollService.isPollExpired(activePoll)) {
      startPollTimer(activePoll._id.toString(), activePoll.duration, activePoll.startedAt);
    } else if (activePoll) {
      // Poll has expired, end it
      await pollService.endPoll(activePoll._id.toString());
    }
  };

  restoreActivePolLTimer();
};

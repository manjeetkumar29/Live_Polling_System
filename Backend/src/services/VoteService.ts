import { Vote, IVote } from '../models';
import { pollService } from './PollService';

interface SubmitVoteData {
  pollId: string;
  optionId: string;
  studentId: string;
  studentName: string;
}

interface VoteResult {
  success: boolean;
  message: string;
  vote?: IVote;
}

const voteLocks = new Map<string, boolean>();

class VoteService {
  async submitVote(data: SubmitVoteData): Promise<VoteResult> {
    const lockKey = `${data.pollId}:${data.studentId}`;
    
    if (voteLocks.get(lockKey)) {
      return { success: false, message: 'Vote submission in progress' };
    }
    
    voteLocks.set(lockKey, true);
    
    try {
      if (!data.studentId || !data.studentName) {
        return { success: false, message: 'Student identification required' };
      }

      const poll = await pollService.getActivePoll();
      
      if (!poll) {
        return { success: false, message: 'No active poll found' };
      }

      if (poll._id.toString() !== data.pollId) {
        return { success: false, message: 'Poll is no longer active' };
      }

      if (pollService.isPollExpired(poll)) {
        return { success: false, message: 'Poll has expired' };
      }

      const optionExists = poll.options.some((opt) => opt.id === data.optionId);
      if (!optionExists) {
        return { success: false, message: 'Invalid option' };
      }

      const existingVote = await Vote.findOne({
        pollId: poll._id,
        studentId: data.studentId
      });

      if (existingVote) {
        return { success: false, message: 'You have already voted on this poll' };
      }

      const vote = new Vote({
        pollId: poll._id,
        optionId: data.optionId,
        studentId: data.studentId,
        studentName: data.studentName
      });

      await vote.save();
      return { success: true, message: 'Vote submitted successfully', vote };
    } catch (error: any) {
      if (error.code === 11000) {
        return { success: false, message: 'You have already voted on this poll' };
      }
      throw error;
    } finally {
      voteLocks.delete(lockKey);
    }
  }

  async hasStudentVoted(pollId: string, studentId: string): Promise<boolean> {
    const vote = await Vote.findOne({ pollId, studentId });
    return !!vote;
  }

  async getVotesForPoll(pollId: string): Promise<IVote[]> {
    return Vote.find({ pollId });
  }

  async getVoteCountsByOption(pollId: string): Promise<Map<string, number>> {
    const votes = await this.getVotesForPoll(pollId);
    const counts = new Map<string, number>();
    
    votes.forEach((vote) => {
      const current = counts.get(vote.optionId) || 0;
      counts.set(vote.optionId, current + 1);
    });

    return counts;
  }
}

export const voteService = new VoteService();

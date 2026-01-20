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

class VoteService {
  // Submit a vote
  async submitVote(data: SubmitVoteData): Promise<VoteResult> {
    // Check if poll exists and is active
    const poll = await pollService.getActivePoll();
    
    if (!poll) {
      return { success: false, message: 'No active poll found' };
    }

    if (poll._id.toString() !== data.pollId) {
      return { success: false, message: 'Poll is no longer active' };
    }

    // Check if poll has expired
    if (pollService.isPollExpired(poll)) {
      return { success: false, message: 'Poll has expired' };
    }

    // Check if option exists
    const optionExists = poll.options.some((opt) => opt.id === data.optionId);
    if (!optionExists) {
      return { success: false, message: 'Invalid option' };
    }

    // Check if student has already voted (unique constraint will also prevent this)
    const existingVote = await Vote.findOne({
      pollId: poll._id,
      studentId: data.studentId
    });

    if (existingVote) {
      return { success: false, message: 'You have already voted on this poll' };
    }

    // Create vote
    try {
      const vote = new Vote({
        pollId: poll._id,
        optionId: data.optionId,
        studentId: data.studentId,
        studentName: data.studentName
      });

      await vote.save();
      return { success: true, message: 'Vote submitted successfully', vote };
    } catch (error: any) {
      // Handle duplicate vote error (from unique index)
      if (error.code === 11000) {
        return { success: false, message: 'You have already voted on this poll' };
      }
      throw error;
    }
  }

  // Check if student has voted on a poll
  async hasStudentVoted(pollId: string, studentId: string): Promise<boolean> {
    const vote = await Vote.findOne({ pollId, studentId });
    return !!vote;
  }

  // Get all votes for a poll
  async getVotesForPoll(pollId: string): Promise<IVote[]> {
    return Vote.find({ pollId });
  }

  // Get vote counts by option for a poll
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

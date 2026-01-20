import { Poll, IPoll, IOption } from '../models';
import { Vote } from '../models';
import { Document } from 'mongoose';

interface CreatePollData {
  question: string;
  options: IOption[];
  duration: number;
}

interface PollResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
  isCorrect: boolean;
}

interface PollWithResults {
  _id: string;
  question: string;
  options: IOption[];
  duration: number;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  results: PollResult[];
  totalVotes: number;
  remainingTime: number;
}

class PollService {
  // Create a new poll
  async createPoll(data: CreatePollData): Promise<IPoll> {
    // First, deactivate any active polls
    await Poll.updateMany({ isActive: true }, { isActive: false, endedAt: new Date() });

    const poll = new Poll({
      question: data.question,
      options: data.options,
      duration: data.duration,
      startedAt: new Date(),
      isActive: true
    });

    await poll.save();
    return poll;
  }

  // Get the currently active poll
  async getActivePoll(): Promise<IPoll | null> {
    return Poll.findOne({ isActive: true });
  }

  // Get poll by ID with results
  async getPollWithResults(pollId: string): Promise<PollWithResults | null> {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    const votes = await Vote.find({ pollId: poll._id });
    const totalVotes = votes.length;

    const results: PollResult[] = poll.options.map((option) => {
      const optionVotes = votes.filter((v) => v.optionId === option.id).length;
      return {
        optionId: option.id,
        text: option.text,
        votes: optionVotes,
        percentage: totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0,
        isCorrect: option.isCorrect
      };
    });

    const now = new Date();
    const endTime = new Date(poll.startedAt.getTime() + poll.duration * 1000);
    const remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

    return {
      _id: poll._id.toString(),
      question: poll.question,
      options: poll.options,
      duration: poll.duration,
      startedAt: poll.startedAt,
      endedAt: poll.endedAt,
      isActive: poll.isActive,
      results,
      totalVotes,
      remainingTime
    };
  }

  // Get active poll with results
  async getActivePollWithResults(): Promise<PollWithResults | null> {
    const poll = await this.getActivePoll();
    if (!poll) return null;
    return this.getPollWithResults(poll._id.toString());
  }

  // End a poll
  async endPoll(pollId: string): Promise<IPoll | null> {
    return Poll.findByIdAndUpdate(
      pollId,
      { isActive: false, endedAt: new Date() },
      { new: true }
    );
  }

  // Get poll history
  async getPollHistory(limit: number = 20): Promise<PollWithResults[]> {
    const polls = await Poll.find({ isActive: false })
      .sort({ createdAt: -1 })
      .limit(limit);

    const pollsWithResults: PollWithResults[] = [];

    for (const poll of polls) {
      const result = await this.getPollWithResults(poll._id.toString());
      if (result) {
        pollsWithResults.push(result);
      }
    }

    return pollsWithResults;
  }

  // Check if poll has expired
  isPollExpired(poll: IPoll): boolean {
    const now = new Date();
    const endTime = new Date(poll.startedAt.getTime() + poll.duration * 1000);
    return now >= endTime;
  }

  // Get remaining time for a poll
  getRemainingTime(poll: IPoll): number {
    const now = new Date();
    const endTime = new Date(poll.startedAt.getTime() + poll.duration * 1000);
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
  }
}

export const pollService = new PollService();

import React, { useState } from 'react';
import { Button } from '../../common';
import type { Poll } from '../../../types';
import './PollVoting.css';

interface PollVotingProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  hasVoted: boolean;
  isLoading?: boolean;
  remainingTime: number;
}

export const PollVoting: React.FC<PollVotingProps> = ({
  poll,
  onVote,
  hasVoted,
  isLoading,
  remainingTime,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onVote(selectedOption);
    }
  };

  return (
    <div className="poll-voting">
      <div className="poll-voting-header">
        <span className="question-number">Question 1</span>
        <span className={`timer ${remainingTime <= 10 ? 'timer-low' : ''}`}>
          ⏱ {formatTime(remainingTime)}
        </span>
      </div>

      <div className="poll-voting-container">
        <div className="poll-question-box">
          <span>{poll.question}</span>
        </div>

        <div className="poll-voting-options">
          {poll.options.map((option, index) => (
            <button
              key={option.id}
              className={`voting-option ${selectedOption === option.id ? 'selected' : ''} ${
                hasVoted ? 'disabled' : ''
              }`}
              onClick={() => !hasVoted && setSelectedOption(option.id)}
              disabled={hasVoted}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-label">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      {!hasVoted && (
        <div className="poll-voting-footer">
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || isLoading || remainingTime <= 0}
            fullWidth
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
};

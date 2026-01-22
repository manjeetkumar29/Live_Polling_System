import React from 'react';
import type { Poll } from '../../../types';
import './PollResults.css';

interface PollResultsProps {
  poll: Poll;
  showPercentages?: boolean;
  onVote?: (optionId: string) => void;
  onSelect?: (optionId: string) => void;
  hasVoted?: boolean;
  canVote?: boolean;
  selectedOptionId?: string | null;
  showResultsBeforeVote?: boolean;
}

export const PollResults: React.FC<PollResultsProps> = ({ 
  poll, 
  showPercentages = true,
  onVote,
  onSelect,
  hasVoted = false,
  canVote = false,
  selectedOptionId = null,
  showResultsBeforeVote = true,
}) => {
  const handleOptionClick = (optionId: string) => {
    if (canVote && !hasVoted) {
      if (onSelect) {
        onSelect(optionId);
      } else if (onVote) {
        onVote(optionId);
      }
    }
  };

  // Only show percentages and bars if the student has voted, poll is inactive, or showResultsBeforeVote is true
  const shouldShowResults = hasVoted || !canVote || showResultsBeforeVote;

  return (
    <div className="poll-results">
      <div className="poll-question-header">
        <span className="question-text">{poll.question}</span>
      </div>

      <div className="poll-options-list">
        {poll.results.map((result, index) => (
          <div 
            key={result.optionId} 
            className={`poll-option-result ${canVote && !hasVoted ? 'clickable' : ''} ${selectedOptionId === result.optionId ? 'selected' : ''}`}
            onClick={() => handleOptionClick(result.optionId)}
          >
            {shouldShowResults && (
              <div className="option-bar-wrapper">
                <div
                  className="option-bar"
                  style={{
                    width: `${result.percentage}%`,
                  }}
                />
              </div>
            )}
            <div className="option-info">
              <span className="option-indicator">
                {index + 1}
              </span>
              <span className="option-text">{result.text}</span>
            </div>
            {shouldShowResults && showPercentages && (
              <span className="option-percentage">{result.percentage}%</span>
            )}
          </div>
        ))}
      </div>

      {poll.totalVotes > 0 && shouldShowResults && (
        <div className="total-votes">
          Total votes: {poll.totalVotes}
        </div>
      )}
    </div>
  );
};

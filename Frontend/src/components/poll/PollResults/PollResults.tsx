import React from 'react';
import type { Poll } from '../../../types';
import './PollResults.css';

interface PollResultsProps {
  poll: Poll;
  showPercentages?: boolean;
}

export const PollResults: React.FC<PollResultsProps> = ({ poll, showPercentages = true }) => {
  const optionColors = ['#6366f1', '#6366f1', '#6366f1', '#6366f1', '#6366f1', '#6366f1'];

  return (
    <div className="poll-results">
      <div className="poll-question-header">
        <span className="question-text">{poll.question}</span>
      </div>

      <div className="poll-options-list">
        {poll.results.map((result, index) => (
          <div key={result.optionId} className="poll-option-result">
            <div className="option-info">
              <span
                className="option-indicator"
                style={{ background: optionColors[index % optionColors.length] }}
              >
                {index + 1}
              </span>
              <span className="option-text">{result.text}</span>
            </div>
            <div className="option-bar-wrapper">
              <div
                className="option-bar"
                style={{
                  width: `${result.percentage}%`,
                  background: optionColors[index % optionColors.length],
                }}
              />
            </div>
            {showPercentages && (
              <span className="option-percentage">{result.percentage}%</span>
            )}
          </div>
        ))}
      </div>

      {poll.totalVotes > 0 && (
        <div className="total-votes">
          Total votes: {poll.totalVotes}
        </div>
      )}
    </div>
  );
};

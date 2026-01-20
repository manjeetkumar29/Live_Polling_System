import React from 'react';
import type { Poll } from '../../../types';
import { PollResults } from '../PollResults';
import './PollHistory.css';

interface PollHistoryProps {
  polls: Poll[];
  onClose: () => void;
}

export const PollHistory: React.FC<PollHistoryProps> = ({ polls, onClose }) => {
  return (
    <div className="poll-history-overlay">
      <div className="poll-history-modal">
        <div className="poll-history-header">
          <h2>View <span className="bold">Poll History</span></h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="poll-history-content">
          {polls.length === 0 ? (
            <p className="no-polls">No previous polls found.</p>
          ) : (
            polls.map((poll, index) => (
              <div key={poll._id} className="poll-history-item">
                <h3>Question {index + 1}</h3>
                <PollResults poll={poll} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

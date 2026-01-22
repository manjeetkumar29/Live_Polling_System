import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PollResults } from "../../components/poll";
import { useSocket } from "../../hooks";
import type { Poll } from "../../types";
import "./PollHistory.css";

export const PollHistory: React.FC = () => {
  const { getPollHistory } = useSocket();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getPollHistory();
        if (result.success && result.polls) {
          setPolls(result.polls);
        } else {
          toast.error(result.message || "Failed to load poll history");
        }
      } catch (error) {
        toast.error("Failed to load poll history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [getPollHistory]);

  return (
    <div className="poll-history-page">
      <div className="poll-history-container">
        <div className="poll-history-header">
          <h1>
            View <span className="bold">Poll History</span>
          </h1>
        </div>

        <div className="poll-history-content">
          {isLoading ? (
            <div className="loading-state">
              <p>Loading poll history...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="empty-state">
              <p>No previous polls found.</p>
            </div>
          ) : (
            <div className="polls-list">
              {polls.map((poll, index) => (
                <div key={poll._id} className="poll-history-item">
                  <div className="poll-number">Question {index + 1}</div>
                  <PollResults poll={poll} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Badge } from '../../components/common';
import { PollVoting, PollResults } from '../../components/poll';
import { ChatPopup } from '../../components/chat';
import { useSocket, usePollTimer } from '../../hooks';
import { useAppStore } from '../../store';
import './StudentDashboard.css';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentPoll, hasVoted, isKicked, students } = useAppStore();
  const { submitVote, getCurrentPoll } = useSocket();
  const { remainingTime } = usePollTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is registered
  useEffect(() => {
    if (!user?.name || user.role !== 'student') {
      navigate('/student/register');
    }
  }, [user, navigate]);

  // Handle kicked status
  useEffect(() => {
    if (isKicked) {
      navigate('/kicked');
    }
  }, [isKicked, navigate]);

  // Recover state on page load
  useEffect(() => {
    getCurrentPoll();
  }, [getCurrentPoll]);

  const handleVote = async (optionId: string) => {
    if (!currentPoll) return;

    setIsSubmitting(true);
    try {
      const result = await submitVote(currentPoll._id, optionId);
      if (result.success) {
        toast.success('Vote submitted!');
      } else {
        toast.error(result.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showResults = hasVoted || (currentPoll && !currentPoll.isActive);
  const showWaiting = !currentPoll || (!currentPoll.isActive && !hasVoted);

  return (
    <div className="student-dashboard">
      <div className="student-content">
        {showWaiting && !currentPoll ? (
          <div className="waiting-section">
            <Badge />
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
            <p className="waiting-text">Wait for the teacher to ask questions..</p>
          </div>
        ) : showResults && currentPoll ? (
          <div className="results-section">
            <div className="results-header">
              <span className="question-number">Question 1</span>
              <span className="timer">⏱ {remainingTime > 0 ? `${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}` : '00:00'}</span>
            </div>
            <PollResults poll={currentPoll} />
            {!currentPoll.isActive && (
              <p className="waiting-next">Wait for the teacher to ask a new question..</p>
            )}
          </div>
        ) : currentPoll ? (
          <PollVoting
            poll={currentPoll}
            onVote={handleVote}
            hasVoted={hasVoted}
            isLoading={isSubmitting}
            remainingTime={remainingTime}
          />
        ) : null}
      </div>

      <ChatPopup students={students} isTeacher={false} />
    </div>
  );
};

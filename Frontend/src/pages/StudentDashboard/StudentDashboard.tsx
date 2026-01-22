import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Badge, Button } from '../../components/common';
import { PollResults } from '../../components/poll';
import { ChatPopup } from '../../components/chat';
import { useSocket, usePollTimer } from '../../hooks';
import { useAppStore } from '../../store';
import './StudentDashboard.css';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentPoll, hasVoted, isKicked, students, _hasHydrated } = useAppStore();
  const { submitVote, getCurrentPoll, registerStudent } = useSocket();
  const { remainingTime } = usePollTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const hasReregistered = useRef(false);
  const submissionLock = useRef(false);

  useEffect(() => {
    if (_hasHydrated && (!user?.name || user.role !== 'student')) {
      navigate('/student/register');
    }
  }, [user, navigate, _hasHydrated]);

  useEffect(() => {
    if (isKicked) {
      navigate('/kicked');
    }
  }, [isKicked, navigate]);

  useEffect(() => {
    const reregisterAndRecover = async () => {
      if (user?.name && user?.sessionId && !hasReregistered.current) {
        hasReregistered.current = true;
        await registerStudent(user.sessionId, user.name);
        getCurrentPoll();
      }
    };
    reregisterAndRecover();
  }, [user, registerStudent, getCurrentPoll]);

  useEffect(() => {
    if (!hasVoted) {
      setSelectedOptionId(null);
    }
  }, [currentPoll?._id, hasVoted]);

  const handleSelectOption = (optionId: string) => {
    if (!hasVoted && !isSubmitting) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitVote = async () => {
    if (!currentPoll || !selectedOptionId || hasVoted || isSubmitting) return;
    
    if (!currentPoll.isActive) {
      toast.error('This poll has ended');
      return;
    }
    
    if (submissionLock.current) return;
    submissionLock.current = true;

    setIsSubmitting(true);
    try {
      const result = await submitVote(currentPoll._id, selectedOptionId);
      if (result.success) {
        toast.success('Vote submitted!');
      } else {
        if (result.message?.includes('already voted')) {
          useAppStore.getState().setHasVoted(true);
        }
        toast.error(result.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
      submissionLock.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!_hasHydrated) {
    return (
      <div className="student-dashboard">
        <div className="student-content">
          <div className="waiting-section">
            <Badge />
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
            <p className="waiting-text">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const showWaiting = !currentPoll;

  return (
    <div className="student-dashboard">
      <div className="student-content">
        {showWaiting ? (
          <div className="waiting-section">
            <Badge />
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
            <p className="waiting-text">Wait for the teacher to ask questions..</p>
          </div>
        ) : currentPoll ? (
          <div className="results-section">
            <div className="results-header">
              <span className="question-number">Question 1</span>
              <span className="timer">⏱ {formatTime(remainingTime)}</span>
            </div>
            <PollResults 
              poll={currentPoll} 
              onVote={handleSubmitVote}
              hasVoted={hasVoted}
              canVote={currentPoll.isActive && !hasVoted}
              selectedOptionId={selectedOptionId}
              onSelect={handleSelectOption}
              showResultsBeforeVote={false}
            />
            {!hasVoted && currentPoll.isActive && (
              <div className="submit-vote-container">
                <Button
                  onClick={handleSubmitVote}
                  disabled={isSubmitting || !selectedOptionId}
                  className="submit-vote-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            )}
            {!currentPoll.isActive && (
              <p className="waiting-next">Wait for the teacher to ask a new question..</p>
            )}
          </div>
        ) : null}
      </div>

      <ChatPopup students={students} isTeacher={false} />
    </div>
  );
};

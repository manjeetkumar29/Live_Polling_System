import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Badge, Button } from '../../components/common';
import { PollCreator } from '../../components/teacher/PollCreator';
import { PollResults, PollHistory } from '../../components/poll';
import { ChatPopup } from '../../components/chat';
import { useSocket, usePollTimer } from '../../hooks';
import { useAppStore } from '../../store';
import type { Poll } from '../../types';
import './TeacherDashboard.css';

export const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, user, setUser, setCurrentPoll } = useAppStore();
  const { createPoll, getPollHistory, kickStudent, getCurrentPoll } = useSocket();
  const { remainingTime, formattedTime, isLowTime } = usePollTimer();
  const [isCreating, setIsCreating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [showPollCreator, setShowPollCreator] = useState(true);

  // Set teacher name and session ID
  useEffect(() => {
    if (!user?.name) {
      setUser({
        role: 'teacher',
        name: 'Teacher',
        sessionId: user?.sessionId || `teacher-${Date.now()}`,
      });
    }
  }, [user, setUser]);

  // Recover state on page load
  useEffect(() => {
    getCurrentPoll();
  }, [getCurrentPoll]);

  // Show poll results when a poll exists
  useEffect(() => {
    if (currentPoll) {
      setShowPollCreator(false);
    }
  }, [currentPoll]);

  const handleCreatePoll = async (
    question: string,
    options: { id: string; text: string; isCorrect: boolean }[],
    duration: number
  ) => {
    setIsCreating(true);
    try {
      const result = await createPoll(question, options, duration);
      if (result.success) {
        toast.success('Poll created successfully!');
        setShowPollCreator(false);
      } else {
        toast.error(result.message || 'Failed to create poll');
      }
    } catch (error) {
      toast.error('Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewHistory = async () => {
    const result = await getPollHistory();
    if (result.success && result.polls) {
      setPollHistory(result.polls);
      setShowHistory(true);
    }
  };

  const handleAskNewQuestion = () => {
    setShowPollCreator(true);
    setCurrentPoll(null);
  };

  const handleKickStudent = async (sessionId: string) => {
    const result = await kickStudent(sessionId);
    if (result.success) {
      toast.success('Student removed');
    } else {
      toast.error('Failed to remove student');
    }
  };

  const showPollCreatorView = showPollCreator || !currentPoll;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-content">
        {currentPoll && !showPollCreatorView && (
          <div className="view-history-btn-wrapper">
            <Button variant="primary" size="small" onClick={handleViewHistory}>
              📋 View Poll history
            </Button>
          </div>
        )}

        {showPollCreatorView ? (
          <div className="poll-creator-wrapper">
            <Badge />
            <PollCreator onCreatePoll={handleCreatePoll} isLoading={isCreating} />
          </div>
        ) : (
          <div className="live-poll-wrapper">
            <div className="poll-section">
              <div className="poll-header">
                <h2 className="section-title">Question</h2>
                <span className={`poll-timer ${isLowTime ? 'timer-low' : ''}`}>
                  ⏱ {formattedTime}
                </span>
              </div>
              {currentPoll && <PollResults poll={currentPoll} />}
              <Button
                variant="primary"
                className="ask-new-question-btn"
                onClick={handleAskNewQuestion}
              >
                + Ask a new question
              </Button>
            </div>
          </div>
        )}
      </div>

      <ChatPopup
        students={students}
        onKickStudent={handleKickStudent}
        isTeacher={true}
      />

      {showHistory && (
        <PollHistory polls={pollHistory} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

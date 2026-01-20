import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Badge, Button } from '../../components/common';
import { PollCreator } from '../../components/teacher/PollCreator';
import { PollResults, PollHistory } from '../../components/poll';
import { ChatPopup } from '../../components/chat';
import { useSocket } from '../../hooks';
import { useAppStore } from '../../store';
import type { Poll } from '../../types';
import './TeacherDashboard.css';

export const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, user, setUser } = useAppStore();
  const { createPoll, getPollHistory, kickStudent, getCurrentPoll } = useSocket();
  const [isCreating, setIsCreating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);

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

  const handleKickStudent = async (sessionId: string) => {
    const result = await kickStudent(sessionId);
    if (result.success) {
      toast.success('Student removed');
    } else {
      toast.error('Failed to remove student');
    }
  };

  const showPollCreator = !currentPoll || !currentPoll.isActive;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-content">
        {currentPoll?.isActive && (
          <div className="view-history-btn-wrapper">
            <Button variant="primary" size="small" onClick={handleViewHistory}>
              📋 View Poll history
            </Button>
          </div>
        )}

        {showPollCreator ? (
          <div className="poll-creator-wrapper">
            <Badge />
            <PollCreator onCreatePoll={handleCreatePoll} isLoading={isCreating} />
          </div>
        ) : (
          <div className="live-poll-wrapper">
            <div className="poll-section">
              <h2 className="section-title">Question</h2>
              {currentPoll && <PollResults poll={currentPoll} />}
              <Button
                variant="primary"
                className="ask-new-question-btn"
                onClick={() => {
                  /* Poll ends automatically or manually */
                }}
                disabled={currentPoll?.isActive}
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

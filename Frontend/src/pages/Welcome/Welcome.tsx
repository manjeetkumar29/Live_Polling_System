import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '../../components/common';
import { useAppStore } from '../../store';
import type { UserRole } from '../../types';
import './Welcome.css';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleContinue = () => {
    if (selectedRole) {
      const sessionId = `${selectedRole}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setUser({
        role: selectedRole,
        name: '',
        sessionId,
      });
      navigate(selectedRole === 'teacher' ? '/teacher' : '/student/register');
    }
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <Badge />

        <h1 className="welcome-title">
          Welcome to the <span className="bold">Live Polling System</span>
        </h1>
        <p className="welcome-subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-selector">
          <div
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('student')}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time</p>
          </div>
        </div>

        <Button onClick={handleContinue} disabled={!selectedRole}>
          Continue
        </Button>
      </div>
    </div>
  );
};

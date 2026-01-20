import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Badge, Button, Input } from '../../components/common';
import { useSocket } from '../../hooks';
import { useAppStore } from '../../store';
import './StudentRegister.css';

export const StudentRegister: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  const { registerStudent } = useSocket();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = user?.sessionId || `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const result = await registerStudent(sessionId, name.trim());

      if (result.success) {
        setUser({
          role: 'student',
          name: name.trim(),
          sessionId,
        });
        navigate('/student');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="student-register-page">
      <div className="student-register-container">
        <Badge />

        <h1 className="register-title">
          Let's <span className="bold">Get Started</span>
        </h1>
        <p className="register-subtitle">
          If you're a student, you'll be able to <span className="underline">submit your answers</span>, participate in live
          polls, and see how your responses compare with your classmates
        </p>

        <div className="register-form">
          <label className="form-label">Enter your Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder=""
          />

          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()} fullWidth>
            {isLoading ? 'Joining...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Button, Input } from '../../common';
import './PollCreator.css';

interface PollOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface PollCreatorProps {
  onCreatePoll: (question: string, options: PollOption[], duration: number) => void;
  isLoading?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const PollCreator: React.FC<PollCreatorProps> = ({ onCreatePoll, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: generateId(), text: '', isCorrect: true },
    { id: generateId(), text: '', isCorrect: false },
  ]);
  const [duration, setDuration] = useState(60);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: generateId(), text: '', isCorrect: false }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const setCorrectOption = (id: string, isCorrect: boolean) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, isCorrect } : opt)));
  };

  const handleSubmit = () => {
    if (!question.trim()) return;
    if (options.some((opt) => !opt.text.trim())) return;

    onCreatePoll(question, options, duration);
    
    // Reset form
    setQuestion('');
    setOptions([
      { id: generateId(), text: '', isCorrect: true },
      { id: generateId(), text: '', isCorrect: false },
    ]);
    setDuration(60);
  };

  return (
    <div className="poll-creator">
      <div className="poll-creator-header">
        <div>
          <h2 className="poll-creator-title">Let's <span className="bold">Get Started</span></h2>
          <p className="poll-creator-subtitle">
            You'll have the ability to create and manage polls, ask questions, and monitor
            your students' responses in real-time.
          </p>
        </div>
        <div className="duration-select">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="duration-dropdown"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>
      </div>

      <div className="poll-creator-form">
        <div className="question-section">
          <label className="form-label">Enter your question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="question-input"
            rows={3}
          />
          <span className="char-count">{question.length}</span>
        </div>

        <div className="options-section">
          <div className="options-header">
            <label className="form-label">Edit Options</label>
            <label className="form-label">Is It Correct?</label>
          </div>

          {options.map((option, index) => (
            <div key={option.id} className="option-row">
              <div className="option-input-wrapper">
                <span className="option-number">{index + 1}</span>
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    className="remove-option-btn"
                    onClick={() => removeOption(option.id)}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="correct-toggle">
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`correct-${option.id}`}
                    checked={option.isCorrect}
                    onChange={() => setCorrectOption(option.id, true)}
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`correct-${option.id}`}
                    checked={!option.isCorrect}
                    onChange={() => setCorrectOption(option.id, false)}
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          <button className="add-option-btn" onClick={addOption} disabled={options.length >= 6}>
            + Add More option
          </button>
        </div>
      </div>

      <div className="poll-creator-footer">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !question.trim() || options.some((opt) => !opt.text.trim())}
        >
          {isLoading ? 'Creating...' : 'Ask Question'}
        </Button>
      </div>
    </div>
  );
};

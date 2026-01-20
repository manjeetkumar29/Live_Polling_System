import React from 'react';
import './Badge.css';

interface BadgeProps {
  text?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text = 'Intervue Poll', className = '' }) => {
  return (
    <div className={`badge ${className}`}>
      <span className="badge-icon">⚡</span>
      <span className="badge-text">{text}</span>
    </div>
  );
};

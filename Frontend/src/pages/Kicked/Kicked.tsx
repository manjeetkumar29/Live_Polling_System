import React from 'react';
import { Badge } from '../../components/common';
import './Kicked.css';

export const Kicked: React.FC = () => {
  return (
    <div className="kicked-page">
      <div className="kicked-container">
        <Badge />
        <h1 className="kicked-title">You've been Kicked out !</h1>
        <p className="kicked-subtitle">
          Looks like the teacher had removed you from the poll system. Please
          Try again sometime.
        </p>
      </div>
    </div>
  );
};

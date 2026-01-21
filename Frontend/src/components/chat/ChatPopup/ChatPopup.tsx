import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { useSocket } from '../../../hooks';
import type { Student } from '../../../types';
import './ChatPopup.css';

interface ChatPopupProps {
  students?: Student[];
  onKickStudent?: (sessionId: string) => void;
  isTeacher?: boolean;
}

export const ChatPopup: React.FC<ChatPopupProps> = ({
  students = [],
  onKickStudent,
  isTeacher = false,
}) => {
  const { messages, isChatOpen, setIsChatOpen, user } = useAppStore();
  const { sendMessage } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isChatOpen) {
    return (
      <button className="chat-toggle-btn" onClick={() => setIsChatOpen(true)}>
        💬
      </button>
    );
  }

  return (
    <div className="chat-popup">
      <div className="chat-popup-header">
        <div className="chat-tabs">
          <button
            className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants
          </button>
        </div>
        <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>
          ×
        </button>
      </div>

      <div className="chat-popup-content">
        {activeTab === 'chat' ? (
          <>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`chat-message-wrapper ${
                    msg.senderId === user?.sessionId ? 'own' : ''
                  }`}
                >
                  <span className="message-sender">{msg.senderName}</span>
                  <div className={`chat-message ${
                    msg.senderId === user?.sessionId ? 'own' : ''
                  }`}>
                    <span className="message-content">{msg.content}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button className="chat-send-btn" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="participants-list">
            <div className="participants-header">
              <span>Name</span>
              {isTeacher && <span>Action</span>}
            </div>
            {students.map((student) => (
              <div key={student.sessionId} className="participant-item">
                <span className="participant-name">{student.name}</span>
                {isTeacher && onKickStudent && (
                  <button
                    className="kick-btn"
                    onClick={() => onKickStudent(student.sessionId)}
                  >
                    Kick out
                  </button>
                )}
              </div>
            ))}
            {students.length === 0 && (
              <p className="no-participants">No participants yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

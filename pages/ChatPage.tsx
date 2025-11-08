
import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import { useChatStore } from '../store/useChatStore';
import { Navigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const sessions = useChatStore((state) => state.sessions);
  const currentSession = useChatStore((state) => state.currentSession());

  if (sessions.length === 0 || !currentSession) {
    // This case should ideally be handled by newSession logic in Sidebar
    // or by redirecting to a new chat if no ID is present in URL
    return <Navigate to="/chat" replace />; 
  }
  
  return <ChatWindow session={currentSession} />;
};

export default ChatPage;

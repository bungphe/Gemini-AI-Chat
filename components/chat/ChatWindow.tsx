
import React from 'react';
import { ChatSession } from '../../types';
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';
import { useAppConfigStore } from '../../store/useAppConfigStore';

interface ChatWindowProps {
  session: ChatSession;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ session }) => {
  const { fontSize, fontFamily } = useAppConfigStore();
  
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a chat to start or create a new one.
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800"
      style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily || 'inherit' }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{session.topic}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Using model: {session.mask.modelConfig.model}
        </p>
      </div>
      <ChatMessageList messages={session.messages} />
      <ChatInputArea session={session} />
    </div>
  );
};

export default ChatWindow;

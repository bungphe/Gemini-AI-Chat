
import React, { useState, KeyboardEvent } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { ChatSession } from '../../types';
import { PaperAirplaneIcon } from '../icons/HeroIcons'; // Placeholder icon

interface ChatInputAreaProps {
  session: ChatSession;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ session }) => {
  const [userInput, setUserInput] = useState('');
  const onUserSubmit = useChatStore((state) => state.onUserSubmit); // Assuming onUserSubmit is renamed
  const isLoading = useChatStore((state) => state.isLoading);


  const handleSubmit = () => {
    if (userInput.trim() && !isLoading) {
      onUserSubmit(session.id, userInput);
      setUserInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
          rows={Math.max(1, Math.min(5, userInput.split('\n').length))}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !userInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInputArea;

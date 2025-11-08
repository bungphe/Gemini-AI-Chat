
import React from 'react';
import { ChatMessage } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer'; // Placeholder for Markdown component
import { UserIcon, SparklesIcon as AssistantIcon, Cog8ToothIcon as SystemIcon } from '../icons/HeroIcons'; // Placeholder icons

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const getMessageContent = (msg: ChatMessage): string => {
    if (typeof msg.content === 'string') {
      return msg.content;
    }
    // For multimodal content, extract text parts or provide a placeholder for images
    return msg.content
      .map(part => {
        if (part.type === 'text') return part.text || '';
        if (part.type === 'image_url') return '[Image]'; // Placeholder for image
        return '';
      })
      .join(' ');
  };
  
  const textContent = getMessageContent(message);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-3 max-w-xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white ${
          isUser ? 'bg-blue-500' : isAssistant ? 'bg-green-500' : 'bg-gray-400'
        }`}>
          {isUser ? <UserIcon className="h-5 w-5" /> : isAssistant ? <AssistantIcon className="h-5 w-5" /> : <SystemIcon className="h-5 w-5" />}
        </div>
        <div
          className={`p-3 rounded-lg shadow-md ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
          }`}
        >
           {message.streaming && textContent.length === 0 ? (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1 delay-75"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
            </div>
          ) : (
            <MarkdownRenderer content={textContent} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;

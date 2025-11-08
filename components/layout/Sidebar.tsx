
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { PlusCircleIcon, Cog6ToothIcon, SparklesIcon, TrashIcon } from '../icons/HeroIcons'; 

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, currentSessionIndex, newSession, selectSession, deleteSession } = useChatStore();

  const handleNewChat = () => {
    const newChatId = newSession(); 
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col space-y-4 border-r border-gray-200 dark:border-gray-700">
      <button
        onClick={handleNewChat}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        aria-label="Create new chat"
      >
        <PlusCircleIcon className="h-5 w-5 mr-2" />
        New Chat
      </button>

      <nav className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1" aria-label="Chat sessions">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
              index === currentSessionIndex
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => {
              selectSession(index);
              navigate(`/chat/${session.id}`);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                selectSession(index);
                navigate(`/chat/${session.id}`);
              }
            }}
          >
            <span className="truncate flex-1">{session.topic}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${session.topic}"?`)) {
                  const wasCurrentSession = index === currentSessionIndex;
                  const totalSessionsBeforeDelete = sessions.length;

                  deleteSession(index); // This updates the store state

                  // After deletion, rely on the store's updated state for navigation
                  // Zustand's setState is synchronous, so getState() here will reflect the update.
                  const updatedSessions = useChatStore.getState().sessions;
                  const updatedCurrentIndex = useChatStore.getState().currentSessionIndex;
                  
                  if (updatedSessions.length > 0) {
                    if (wasCurrentSession || (totalSessionsBeforeDelete === 1 && updatedSessions.length === 1)) {
                       // If the deleted session was current OR it was the only session (and a new one was created)
                       // navigate to the (new) current session.
                      navigate(`/chat/${updatedSessions[updatedCurrentIndex].id}`);
                    } else if (updatedCurrentIndex >= 0 && updatedCurrentIndex < updatedSessions.length) {
                       // If a non-current session was deleted, and the current index is still valid,
                       // navigate to the current session (which might be the same or shifted).
                       // This handles the case where the currentSessionIndex was adjusted by deleteSession.
                      navigate(`/chat/${updatedSessions[updatedCurrentIndex].id}`);
                    } else {
                      // Fallback if index is somehow invalid but sessions exist (should be rare)
                      navigate(`/chat/${updatedSessions[0].id}`);
                    }
                  } else {
                    // This should not happen if deleteSession correctly creates a new session when all are deleted.
                    // However, as an absolute fallback:
                    handleNewChat();
                  }
                }
              }}
              className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
              aria-label={`Delete chat: ${session.topic}`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <Link
          to="/masks"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Masks
        </Link>
        <Link
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

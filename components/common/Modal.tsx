
import React, { ReactNode } from 'react';
import { XMarkIcon } from '../icons/HeroIcons'; // Placeholder

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isOpen?: boolean; // Typically managed outside if this is just the presentation
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  // This component assumes it's rendered conditionally by its parent based on an isOpen state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};


import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // No custom props needed for basic input, but can be extended
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      {...props}
      className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    />
  );
};

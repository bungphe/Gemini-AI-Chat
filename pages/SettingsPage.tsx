
import React from 'react';
import { useAppConfigStore } from '../store/useAppConfigStore';
import { Theme } from '../types'; // Ensure Theme is imported
import { Select, SelectOption } from '../components/common/Select';

const SettingsPage: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily } = useAppConfigStore();

  const themeOptions: SelectOption[] = [
    { value: Theme.Auto, label: 'Auto' },
    { value: Theme.Light, label: 'Light' },
    { value: Theme.Dark, label: 'Dark' },
  ];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-4">Settings</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Theme
          </label>
          <Select
            id="theme-select"
            options={themeOptions}
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="w-full max-w-xs"
          />
        </div>

        <div>
          <label htmlFor="font-size-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Size (px)
          </label>
          <input
            id="font-size-input"
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="mt-1 block w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="font-family-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Family
          </label>
          <input
            id="font-family-input"
            type="text"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            placeholder="e.g., Inter, Roboto, sans-serif"
            className="mt-1 block w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="pt-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">API Key Information</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            The Gemini API Key is configured via an environment variable (<code>process.env.API_KEY</code>) and is not user-configurable through this interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

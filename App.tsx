
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppConfigStore } from './store/useAppConfigStore';
import { Theme } from './types';
import Layout from './components/layout/Layout';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import MasksPage from './pages/MasksPage';

const App: React.FC = () => {
  const theme = useAppConfigStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove(Theme.Light, Theme.Dark);
    if (theme === Theme.Auto) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? Theme.Dark : Theme.Light);
    } else {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:id" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="masks" element={<MasksPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import useSettingsStore from './stores/useSettingsStore';
import SearchBar from './components/SearchBar/SearchBar';
import Clock from './components/Clock/Clock';
import Weather from './components/Weather/Weather';
import QuoteEngine from './components/QuoteEngine/QuoteEngine';
import AIPanel from './components/AIPanel/AIPanel';
import GoogleApps from './components/GoogleApps/GoogleApps';
import TodoManager from './components/TodoManager/TodoManager';
import BookmarksSidebar from './components/BookmarksSidebar/BookmarksSidebar';
import SettingsSidebar from './components/SettingsSidebar/SettingsSidebar';
import { isRTL } from './utils/i18n';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
};

const widgetVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
};

function AppContent() {
  const {
    userName, greeting, language, wallpaperUrl, _loaded,
    showSearchBar, showClock, showWeather, showQuote,
    showAIPanel, showGoogleApps, showTodo,
    loadSettings,
  } = useSettingsStore();

  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
  }, [language]);

  if (!_loaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    return userName ? `${timeGreeting}, ${userName}` : timeGreeting;
  };

  return (
    <div
      className="app-root"
      style={wallpaperUrl ? {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      {wallpaperUrl && <div className="wallpaper-overlay" />}

      {/* Top bar */}
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setBookmarksOpen(true)} title="Bookmarks">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        <div className="top-bar-spacer" />
        <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
      </div>

      {/* Main content */}
      <motion.main
        className="main-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting */}
        <motion.div className="greeting-section" variants={widgetVariants}>
          <h1 className="greeting-text">{getGreeting()}</h1>
        </motion.div>

        {/* Search */}
        {showSearchBar && (
          <motion.div variants={widgetVariants}>
            <SearchBar />
          </motion.div>
        )}

        {/* Clock */}
        {showClock && (
          <motion.div className="widget-card clock-card" variants={widgetVariants}>
            <Clock />
          </motion.div>
        )}

        {/* Widgets Grid */}
        <div className="widgets-grid">
          {/* Left Column */}
          <div className="widgets-column">
            {showWeather && (
              <motion.div variants={widgetVariants}>
                <Weather />
              </motion.div>
            )}
            {showTodo && (
              <motion.div variants={widgetVariants}>
                <TodoManager />
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="widgets-column">
            {showAIPanel && (
              <motion.div variants={widgetVariants}>
                <AIPanel />
              </motion.div>
            )}
            {showGoogleApps && (
              <motion.div variants={widgetVariants}>
                <GoogleApps />
              </motion.div>
            )}
          </div>
        </div>

        {/* Quote */}
        {showQuote && (
          <motion.div variants={widgetVariants}>
            <QuoteEngine />
          </motion.div>
        )}

        {/* Powered By Footer */}
        <motion.div className="powered-by" variants={widgetVariants}>
          Powered by{' '}
          <a
            href="https://axiabits.com/"
            target="_blank"
            rel="noopener"
            className="powered-by-link"
          >
            Axiabits
          </a>
        </motion.div>
      </motion.main>

      {/* Sidebars */}
      <BookmarksSidebar isOpen={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      <SettingsSidebar isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore from '../../stores/useSettingsStore';
import { extractColorFromImage } from '../../contexts/ThemeContext';
import { getSupportedLanguages } from '../../utils/i18n';
import './SettingsSidebar.css';

export default function SettingsSidebar({ isOpen, onClose }) {
  const settings = useSettingsStore();
  const { updateSetting, exportSettings, importSettings, resetSettings } = settings;
  const fileInputRef = useRef(null);
  const wallpaperInputRef = useRef(null);
  const languages = getSupportedLanguages();

  const handleBackup = () => {
    const data = exportSettings();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easenmia-settings-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importSettings(data);
        alert('Settings restored successfully!');
      } catch (err) {
        alert('Invalid settings file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWallpaper = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      updateSetting('wallpaperUrl', dataUrl);
      // Extract color from wallpaper
      const img = new Image();
      img.onload = async () => {
        const color = await extractColorFromImage(img);
        updateSetting('sourceColor', color);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      resetSettings();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="settings-sidebar"
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="settings-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="settings-content">
              {/* Appearance */}
              <div className="settings-section">
                <h3 className="settings-section-title">Appearance</h3>

                <div className="setting-row">
                  <span className="setting-label">Theme</span>
                  <div className="setting-toggle-group">
                    {['light', 'dark', 'system'].map(mode => (
                      <button
                        key={mode}
                        className={`setting-toggle-btn ${settings.themeMode === mode ? 'active' : ''}`}
                        onClick={() => updateSetting('themeMode', mode)}
                      >
                        {mode === 'light' && '☀️'}
                        {mode === 'dark' && '🌙'}
                        {mode === 'system' && '💻'}
                        <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-row">
                  <span className="setting-label">Accent Color</span>
                  <input
                    type="color"
                    className="setting-color-picker"
                    value={settings.sourceColor}
                    onChange={(e) => updateSetting('sourceColor', e.target.value)}
                  />
                </div>

                <div className="setting-row">
                  <span className="setting-label">Display Effect</span>
                  <div className="setting-toggle-group">
                    <button
                      className={`setting-toggle-btn ${!settings.glassmorphism && !settings.liquidDisplay ? 'active' : ''}`}
                      onClick={() => { updateSetting('glassmorphism', false); updateSetting('liquidDisplay', false); }}
                    >
                      None
                    </button>
                    <button
                      className={`setting-toggle-btn ${settings.glassmorphism && !settings.liquidDisplay ? 'active' : ''}`}
                      onClick={() => { updateSetting('glassmorphism', true); updateSetting('liquidDisplay', false); }}
                    >
                      🪟 Glass
                    </button>
                    <button
                      className={`setting-toggle-btn ${settings.liquidDisplay ? 'active' : ''}`}
                      onClick={() => { updateSetting('glassmorphism', true); updateSetting('liquidDisplay', true); }}
                    >
                      💧 Liquid
                    </button>
                  </div>
                </div>

                <div className="setting-row">
                  <span className="setting-label">Wallpaper</span>
                  <button className="setting-btn-sm" onClick={() => wallpaperInputRef.current?.click()}>
                    Upload
                  </button>
                  <input
                    ref={wallpaperInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleWallpaper}
                  />
                  {settings.wallpaperUrl && (
                    <button className="setting-btn-sm danger" onClick={() => updateSetting('wallpaperUrl', '')}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Clock */}
              <div className="settings-section">
                <h3 className="settings-section-title">Clock</h3>
                <div className="setting-row">
                  <span className="setting-label">Style</span>
                  <div className="setting-toggle-group">
                    {['digital', 'analog'].map(mode => (
                      <button
                        key={mode}
                        className={`setting-toggle-btn ${settings.clockMode === mode ? 'active' : ''}`}
                        onClick={() => updateSetting('clockMode', mode)}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {settings.clockMode === 'digital' && (
                  <div className="setting-row">
                    <span className="setting-label">Format</span>
                    <div className="setting-toggle-group">
                      {['12h', '24h'].map(fmt => (
                        <button
                          key={fmt}
                          className={`setting-toggle-btn ${settings.clockFormat === fmt ? 'active' : ''}`}
                          onClick={() => updateSetting('clockFormat', fmt)}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="settings-section">
                <h3 className="settings-section-title">Search</h3>
                <div className="setting-row">
                  <span className="setting-label">Default Engine</span>
                  <select
                    className="setting-select"
                    value={settings.searchEngine}
                    onChange={(e) => updateSetting('searchEngine', e.target.value)}
                  >
                    <option value="google">Google</option>
                    <option value="bing">Bing</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                    <option value="brave">Brave</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>

              {/* Weather */}
              <div className="settings-section">
                <h3 className="settings-section-title">Weather</h3>
                <div className="setting-row">
                  <span className="setting-label">Unit</span>
                  <div className="setting-toggle-group">
                    {[['metric', '°C'], ['imperial', '°F']].map(([val, label]) => (
                      <button
                        key={val}
                        className={`setting-toggle-btn ${settings.weatherUnit === val ? 'active' : ''}`}
                        onClick={() => updateSetting('weatherUnit', val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">API Key</span>
                  <input
                    type="password"
                    className="setting-text-input"
                    placeholder="OpenWeatherMap key..."
                    value={settings.weatherApiKey}
                    onChange={(e) => updateSetting('weatherApiKey', e.target.value)}
                  />
                </div>
              </div>

              {/* Personalization */}
              <div className="settings-section">
                <h3 className="settings-section-title">Personalization</h3>
                <div className="setting-row">
                  <span className="setting-label">Name</span>
                  <input
                    type="text"
                    className="setting-text-input"
                    placeholder="Your name..."
                    value={settings.userName}
                    onChange={(e) => updateSetting('userName', e.target.value)}
                  />
                </div>
                <div className="setting-row">
                  <span className="setting-label">Greeting</span>
                  <input
                    type="text"
                    className="setting-text-input"
                    placeholder="Custom greeting..."
                    value={settings.greeting}
                    onChange={(e) => updateSetting('greeting', e.target.value)}
                  />
                </div>
              </div>

              {/* Widgets */}
              <div className="settings-section">
                <h3 className="settings-section-title">Widgets</h3>
                {[
                  ['showClock', 'Clock'],
                  ['showWeather', 'Weather'],
                  ['showQuote', 'Quote'],
                  ['showAIPanel', 'AI Tools'],
                  ['showGoogleApps', 'Google Apps'],
                  ['showTodo', 'Tasks'],
                  ['showSearchBar', 'Search Bar'],
                ].map(([key, label]) => (
                  <div className="setting-row" key={key}>
                    <span className="setting-label">{label}</span>
                    <label className="setting-switch">
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) => updateSetting(key, e.target.checked)}
                      />
                      <span className="setting-switch-slider" />
                    </label>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div className="settings-section">
                <h3 className="settings-section-title">Tasks</h3>
                <div className="setting-row">
                  <span className="setting-label">Auto-clear at midnight</span>
                  <label className="setting-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoClearTodos}
                      onChange={(e) => updateSetting('autoClearTodos', e.target.checked)}
                    />
                    <span className="setting-switch-slider" />
                  </label>
                </div>
              </div>

              {/* Language */}
              <div className="settings-section">
                <h3 className="settings-section-title">Language</h3>
                <div className="setting-row">
                  <span className="setting-label">Display Language</span>
                  <select
                    className="setting-select"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data */}
              <div className="settings-section">
                <h3 className="settings-section-title">Data</h3>
                <div className="setting-row-buttons">
                  <button className="setting-btn" onClick={handleBackup}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Backup
                  </button>
                  <button className="setting-btn" onClick={() => fileInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                    Restore
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleRestore}
                  />
                  <button className="setting-btn danger" onClick={handleReset}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    </svg>
                    Reset All
                  </button>
                </div>
              </div>

              {/* Branding */}
              <div className="settings-branding">
                <a
                  href="https://axiabits.com/"
                  target="_blank"
                  rel="noopener"
                  className="settings-branding-name"
                >
                  Easenmia
                </a>
                <span className="settings-branding-by">
                  Made by{' '}
                  <a
                    href="https://axiabits.com/"
                    target="_blank"
                    rel="noopener"
                    className="settings-branding-link"
                  >
                    Axiabits
                  </a>
                </span>
                <a
                  href="https://axiabits.com/"
                  target="_blank"
                  rel="noopener"
                  className="settings-visit-link"
                >
                  Visit axiabits.com →
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { create } from 'zustand';

const DEFAULT_SETTINGS = {
  themeMode: 'system',
  sourceColor: '#6750A4',
  glassmorphism: false,
  liquidDisplay: false,
  clockMode: 'digital',
  clockFormat: '12h',
  searchEngine: 'google',
  userName: '',
  greeting: '',
  weatherUnit: 'metric',
  weatherApiKey: '',
  autoClearTodos: true,
  language: 'en',
  showWeather: true,
  showClock: true,
  showQuote: true,
  showAIPanel: true,
  showGoogleApps: true,
  showTodo: true,
  showSearchBar: true,
  wallpaperUrl: '',
};

const useSettingsStore = create((set, get) => ({
  ...DEFAULT_SETTINGS,
  _loaded: false,

  loadSettings: async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const syncData = await chrome.storage.sync.get(null);
        const localData = await chrome.storage.local.get(['wallpaperUrl', 'todos', 'quoteCache']);
        set({ ...DEFAULT_SETTINGS, ...syncData, ...localData, _loaded: true });
      } else {
        const saved = localStorage.getItem('easenmia-settings');
        if (saved) {
          set({ ...DEFAULT_SETTINGS, ...JSON.parse(saved), _loaded: true });
        } else {
          set({ _loaded: true });
        }
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
      set({ _loaded: true });
    }
  },

  updateSetting: (key, value) => {
    set({ [key]: value });
    const state = get();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const largeKeys = ['wallpaperUrl', 'todos', 'quoteCache'];
        if (largeKeys.includes(key)) {
          chrome.storage.local.set({ [key]: value });
        } else {
          const syncData = {};
          Object.keys(DEFAULT_SETTINGS).forEach(k => {
            if (!largeKeys.includes(k)) {
              syncData[k] = state[k];
            }
          });
          syncData[key] = value;
          chrome.storage.sync.set(syncData);
        }
      } else {
        const allData = {};
        Object.keys(DEFAULT_SETTINGS).forEach(k => {
          allData[k] = state[k];
        });
        allData[key] = value;
        localStorage.setItem('easenmia-settings', JSON.stringify(allData));
      }
    } catch (e) {
      console.warn('Failed to save setting:', e);
    }
  },

  updateSettings: (updates) => {
    set(updates);
    const state = get();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const syncData = {};
        const localData = {};
        const largeKeys = ['wallpaperUrl', 'todos', 'quoteCache'];
        Object.keys(updates).forEach(key => {
          if (largeKeys.includes(key)) {
            localData[key] = updates[key];
          } else {
            syncData[key] = updates[key];
          }
        });
        if (Object.keys(syncData).length > 0) chrome.storage.sync.set(syncData);
        if (Object.keys(localData).length > 0) chrome.storage.local.set(localData);
      } else {
        const allData = {};
        Object.keys(DEFAULT_SETTINGS).forEach(k => {
          allData[k] = state[k];
        });
        Object.assign(allData, updates);
        localStorage.setItem('easenmia-settings', JSON.stringify(allData));
      }
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  exportSettings: () => {
    const state = get();
    const data = {};
    Object.keys(DEFAULT_SETTINGS).forEach(k => {
      data[k] = state[k];
    });
    return data;
  },

  importSettings: (data) => {
    const merged = { ...DEFAULT_SETTINGS, ...data };
    set(merged);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const syncData = {};
        const localData = {};
        const largeKeys = ['wallpaperUrl', 'todos', 'quoteCache'];
        Object.keys(merged).forEach(key => {
          if (largeKeys.includes(key)) {
            localData[key] = merged[key];
          } else if (key in DEFAULT_SETTINGS) {
            syncData[key] = merged[key];
          }
        });
        chrome.storage.sync.set(syncData);
        chrome.storage.local.set(localData);
      } else {
        localStorage.setItem('easenmia-settings', JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('Failed to import settings:', e);
    }
  },

  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.clear();
        chrome.storage.local.clear();
      } else {
        localStorage.removeItem('easenmia-settings');
      }
    } catch (e) {
      console.warn('Failed to reset settings:', e);
    }
  },
}));

export default useSettingsStore;

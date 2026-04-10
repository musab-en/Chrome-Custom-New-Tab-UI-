export function getMessage(key, substitutions) {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      return chrome.i18n.getMessage(key, substitutions) || key;
    }
  } catch (e) {
    // fallback
  }
  return key;
}

export function getUILanguage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      return chrome.i18n.getUILanguage();
    }
  } catch (e) {
    // fallback
  }
  return navigator.language || 'en';
}

const LANGUAGE_NAMES = {
  en: 'English',
  ur: 'اردو',
  ar: 'العربية',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  zh_CN: '简体中文',
  zh_TW: '繁體中文',
  ja: '日本語',
  ko: '한국어',
  tr: 'Türkçe',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  fa: 'فارسی',
  he: 'עברית',
  uk: 'Українська',
  cs: 'Čeština',
  ro: 'Română',
  el: 'Ελληνικά',
};

export function getSupportedLanguages() {
  return LANGUAGE_NAMES;
}

export function isRTL(lang) {
  return ['ar', 'ur', 'fa', 'he'].includes(lang);
}

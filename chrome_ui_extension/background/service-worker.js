/* Background Service Worker — Privacy-First Fetching */

const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const QUOTES_URL = 'https://zenquotes.io/api/today';

const SUGGESTION_ENDPOINTS = {
  google: (q) => `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`,
  brave: (q) => `https://search.brave.com/api/suggest?q=${encodeURIComponent(q)}&rich=false`,
  bing: (q) => `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`,
  youtube: (q) => `https://www.google.com/complete/search?client=chrome&ds=yt&q=${encodeURIComponent(q)}`,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_WEATHER') {
    fetchWeather(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'FETCH_QUOTE') {
    fetchQuote()
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'FETCH_SUGGESTIONS') {
    fetchSuggestions(message.payload.query, message.payload.engine)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function fetchWeather({ lat, lon, units, apiKey }) {
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }
  const url = `${WEATHER_BASE}?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Weather API error: ${resp.status}`);
  return resp.json();
}

async function fetchQuote() {
  try {
    const resp = await fetch(QUOTES_URL);
    if (!resp.ok) throw new Error(`Quotes API error: ${resp.status}`);
    const data = await resp.json();
    return data;
  } catch (e) {
    // Fallback quotes
    const fallback = [
      { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
      { q: "Innovation distinguishes between a leader and a follower.", a: "Steve Jobs" },
      { q: "Stay hungry, stay foolish.", a: "Steve Jobs" },
      { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
      { q: "It is during our darkest moments that we must focus to see the light.", a: "Aristotle" },
      { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
      { q: "Your time is limited, don't waste it living someone else's life.", a: "Steve Jobs" },
      { q: "If you look at what you have in life, you'll always have more.", a: "Oprah Winfrey" },
      { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
      { q: "The purpose of our lives is to be happy.", a: "Dalai Lama" },
    ];
    const idx = new Date().getDate() % fallback.length;
    return [fallback[idx]];
  }
}

async function fetchSuggestions(query, engine) {
  if (!query || query.trim().length === 0) return [];
  const endpoint = SUGGESTION_ENDPOINTS[engine] || SUGGESTION_ENDPOINTS.google;
  const url = endpoint(query);
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 8);
    }
    if (Array.isArray(data)) {
      return data.map(item => item.phrase || item).slice(0, 8);
    }
    return [];
  } catch (e) {
    return [];
  }
}

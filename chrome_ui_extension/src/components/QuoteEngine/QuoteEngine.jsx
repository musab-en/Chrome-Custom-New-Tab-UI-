import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sanitize } from '../../utils/sanitize';
import './QuoteEngine.css';

export default function QuoteEngine() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem('easenmia-quote-cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          setQuote(data);
          return;
        }
      }

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'FETCH_QUOTE' }, (response) => {
          if (response?.success && response.data) {
            const q = Array.isArray(response.data) ? response.data[0] : response.data;
            const cleaned = {
              text: sanitize(q.q || q.text || q.content || ''),
              author: sanitize(q.a || q.author || 'Unknown'),
            };
            setQuote(cleaned);
            localStorage.setItem('easenmia-quote-cache', JSON.stringify({
              data: cleaned,
              timestamp: Date.now()
            }));
          }
        });
      } else {
        // Fallback
        setQuote({
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        });
      }
    } catch (e) {
      setQuote({
        text: "Stay hungry, stay foolish.",
        author: "Steve Jobs"
      });
    }
  };

  if (!quote) return null;

  return (
    <motion.div
      className="quote-widget"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="quote-icon">"</div>
      <p className="quote-text">{quote.text}</p>
      <p className="quote-author">— {quote.author}</p>
    </motion.div>
  );
}

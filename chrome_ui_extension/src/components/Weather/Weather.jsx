import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useSettingsStore from '../../stores/useSettingsStore';
import { sanitize } from '../../utils/sanitize';
import './Weather.css';

const WEATHER_ICONS = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '🌨️', '13n': '🌨️',
  '50d': '🌫️', '50n': '🌫️',
};

export default function Weather() {
  const { weatherUnit, weatherApiKey } = useSettingsStore();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          {
            type: 'FETCH_WEATHER',
            payload: { lat, lon, units: weatherUnit, apiKey: weatherApiKey }
          },
          (response) => {
            if (response?.success) {
              setWeather(sanitize(response.data));
              setError(null);
            } else {
              setError(response?.error || 'Failed to fetch weather');
            }
            setLoading(false);
          }
        );
      } else {
        setError('Weather requires Chrome extension environment');
        setLoading(false);
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }, [weatherUnit, weatherApiKey]);

  useEffect(() => {
    if (!weatherApiKey) {
      setError('Add your OpenWeatherMap API key in Settings');
      setLoading(false);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          setError('Location access denied. Enable it in settings.');
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, [fetchWeather, weatherApiKey]);

  const unitSymbol = weatherUnit === 'metric' ? '°C' : '°F';
  const icon = weather?.weather?.[0]?.icon || '01d';

  return (
    <motion.div
      className="weather-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {loading && (
        <div className="weather-loading">
          <div className="weather-loading-pulse" />
        </div>
      )}
      {error && (
        <div className="weather-error">
          <span className="weather-error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {weather && !loading && !error && (
        <>
          <div className="weather-main">
            <span className="weather-emoji">{WEATHER_ICONS[icon] || '🌤️'}</span>
            <div className="weather-temp-block">
              <span className="weather-temp">{Math.round(weather.main?.temp || 0)}{unitSymbol}</span>
              <span className="weather-desc">
                {weather.weather?.[0]?.description
                  ? weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)
                  : ''}
              </span>
            </div>
          </div>
          <div className="weather-details">
            <div className="weather-detail">
              <span className="weather-detail-label">Feels</span>
              <span className="weather-detail-value">{Math.round(weather.main?.feels_like || 0)}{unitSymbol}</span>
            </div>
            <div className="weather-detail">
              <span className="weather-detail-label">Min</span>
              <span className="weather-detail-value">{Math.round(weather.main?.temp_min || 0)}{unitSymbol}</span>
            </div>
            <div className="weather-detail">
              <span className="weather-detail-label">Max</span>
              <span className="weather-detail-value">{Math.round(weather.main?.temp_max || 0)}{unitSymbol}</span>
            </div>
            <div className="weather-detail">
              <span className="weather-detail-label">Humidity</span>
              <span className="weather-detail-value">{weather.main?.humidity || 0}%</span>
            </div>
          </div>
          <div className="weather-location">
            📍 {weather.name || 'Unknown'}
          </div>
        </>
      )}
    </motion.div>
  );
}

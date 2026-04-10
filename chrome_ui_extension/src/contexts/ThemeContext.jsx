import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themeFromSourceColor, argbFromHex, hexFromArgb } from '@material/material-color-utilities';
import useSettingsStore from '../stores/useSettingsStore';

const ThemeContext = createContext(null);

const COLOR_ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground', 'surface', 'onSurface',
  'surfaceVariant', 'onSurfaceVariant', 'outline', 'outlineVariant',
  'inverseSurface', 'inverseOnSurface', 'inversePrimary',
  'surfaceDim', 'surfaceBright', 'surfaceContainerLowest',
  'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh',
  'surfaceContainerHighest',
];

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

export function ThemeProvider({ children }) {
  const { themeMode, sourceColor, glassmorphism, liquidDisplay } = useSettingsStore();
  const [isDark, setIsDark] = useState(false);
  const [themeColors, setThemeColors] = useState({});

  const getSystemDark = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(getSystemDark());
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setIsDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, getSystemDark]);

  useEffect(() => {
    try {
      const argb = argbFromHex(sourceColor);
      const theme = themeFromSourceColor(argb);
      const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
      const colors = {};

      COLOR_ROLES.forEach(role => {
        if (typeof scheme[role] !== 'undefined') {
          const hex = hexFromArgb(scheme[role]);
          const cssVar = `--md-sys-color-${camelToKebab(role)}`;
          colors[role] = hex;
          document.documentElement.style.setProperty(cssVar, hex);
          // Also set RGB version for rgba() usage
          document.documentElement.style.setProperty(`${cssVar}-rgb`, hexToRgb(hex));
        }
      });

      // Extra custom tokens
      document.documentElement.style.setProperty('--md-sys-color-seed', sourceColor);

      // Determine visual display mode
      const isGlass = glassmorphism;
      const isLiquid = liquidDisplay;

      if (isLiquid) {
        document.documentElement.style.setProperty('--glass-blur', '40px');
        document.documentElement.style.setProperty('--glass-opacity', '0.15');
        document.documentElement.style.setProperty('--glass-border', `1px solid rgba(255,255,255, ${isDark ? '0.08' : '0.25'})`);
        document.documentElement.style.setProperty('--glass-shadow', `0 8px 32px rgba(0,0,0, ${isDark ? '0.5' : '0.15'})`);
        document.documentElement.style.setProperty('--glass-saturate', '1.8');
        document.documentElement.style.setProperty('--liquid-glow', hexToRgb(colors.primary || sourceColor));
      } else if (isGlass) {
        document.documentElement.style.setProperty('--glass-blur', '20px');
        document.documentElement.style.setProperty('--glass-opacity', isDark ? '0.25' : '0.55');
        document.documentElement.style.setProperty('--glass-border', `1px solid rgba(255,255,255, ${isDark ? '0.1' : '0.2'})`);
        document.documentElement.style.setProperty('--glass-shadow', '0 4px 16px rgba(0,0,0,0.08)');
        document.documentElement.style.setProperty('--glass-saturate', '1.2');
        document.documentElement.style.setProperty('--liquid-glow', '0,0,0');
      } else {
        document.documentElement.style.setProperty('--glass-blur', '0px');
        document.documentElement.style.setProperty('--glass-opacity', '1');
        document.documentElement.style.setProperty('--glass-border', 'none');
        document.documentElement.style.setProperty('--glass-shadow', '0 1px 3px rgba(0,0,0,0.04)');
        document.documentElement.style.setProperty('--glass-saturate', '1');
        document.documentElement.style.setProperty('--liquid-glow', '0,0,0');
      }

      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-glass', (isGlass || isLiquid) ? 'true' : 'false');
      document.documentElement.setAttribute('data-liquid', isLiquid ? 'true' : 'false');

      setThemeColors(colors);
    } catch (e) {
      console.warn('Theme error:', e);
    }
  }, [sourceColor, isDark, glassmorphism, liquidDisplay]);

  return (
    <ThemeContext.Provider value={{ isDark, themeColors, sourceColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function extractColorFromImage(imageElement) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(imageElement, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size).data;

      const colorCounts = {};
      for (let i = 0; i < imageData.length; i += 16) {
        const r = Math.round(imageData[i] / 32) * 32;
        const g = Math.round(imageData[i + 1] / 32) * 32;
        const b = Math.round(imageData[i + 2] / 32) * 32;
        const a = imageData[i + 3];
        if (a < 128) continue;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (sat < 30) continue;
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      let maxCount = 0;
      let dominantColor = [100, 80, 164];
      Object.entries(colorCounts).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = key.split(',').map(Number);
        }
      });

      const hex = '#' + dominantColor.map(c => Math.min(255, c).toString(16).padStart(2, '0')).join('');
      resolve(hex);
    } catch (e) {
      resolve('#6750A4');
    }
  });
}

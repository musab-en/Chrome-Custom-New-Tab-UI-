import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useSettingsStore from '../../stores/useSettingsStore';
import './Clock.css';

export default function Clock() {
  const { clockMode, clockFormat } = useSettingsStore();
  const [time, setTime] = useState(new Date());
  const animFrameRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setTime(new Date());
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (clockMode === 'analog') {
    return <AnalogClock time={time} />;
  }
  return <DigitalClock time={time} format={clockFormat} />;
}

function DigitalClock({ time, format }) {
  let hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  let period = '';

  if (format === '12h') {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  const dateStr = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="digital-clock"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="digital-time">
        <span className="digital-hours">{hours.toString().padStart(2, '0')}</span>
        <span className="digital-separator">:</span>
        <span className="digital-minutes">{minutes}</span>
        {format === '12h' && <span className="digital-period">{period}</span>}
      </div>
      <div className="digital-date">{dateStr}</div>
    </motion.div>
  );
}

function AnalogClock({ time }) {
  const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  const markers = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const isHour = true;
    const innerR = 88;
    const outerR = 95;
    markers.push(
      <line
        key={i}
        x1={100 + innerR * Math.sin(angle)}
        y1={100 - innerR * Math.cos(angle)}
        x2={100 + outerR * Math.sin(angle)}
        y2={100 - outerR * Math.cos(angle)}
        stroke="var(--md-sys-color-on-surface-variant)"
        strokeWidth={i % 3 === 0 ? 3 : 1.5}
        strokeLinecap="round"
      />
    );
  }

  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const angle = (i * 6 * Math.PI) / 180;
    markers.push(
      <circle
        key={`m-${i}`}
        cx={100 + 92 * Math.sin(angle)}
        cy={100 - 92 * Math.cos(angle)}
        r={1}
        fill="var(--md-sys-color-outline-variant)"
      />
    );
  }

  return (
    <motion.div
      className="analog-clock"
      initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <svg viewBox="0 0 200 200" className="clock-svg">
        <circle
          cx="100" cy="100" r="98"
          fill="var(--md-sys-color-surface-container)"
          stroke="var(--md-sys-color-outline-variant)"
          strokeWidth="1"
        />
        {markers}
        {/* Hour hand */}
        <line
          x1="100" y1="100"
          x2={100 + 50 * Math.sin((hourDeg * Math.PI) / 180)}
          y2={100 - 50 * Math.cos((hourDeg * Math.PI) / 180)}
          stroke="var(--md-sys-color-on-surface)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Minute hand */}
        <line
          x1="100" y1="100"
          x2={100 + 70 * Math.sin((minuteDeg * Math.PI) / 180)}
          y2={100 - 70 * Math.cos((minuteDeg * Math.PI) / 180)}
          stroke="var(--md-sys-color-on-surface)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Second hand */}
        <line
          x1={100 - 15 * Math.sin((secondDeg * Math.PI) / 180)}
          y1={100 + 15 * Math.cos((secondDeg * Math.PI) / 180)}
          x2={100 + 78 * Math.sin((secondDeg * Math.PI) / 180)}
          y2={100 - 78 * Math.cos((secondDeg * Math.PI) / 180)}
          stroke="var(--md-sys-color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="var(--md-sys-color-primary)" />
        <circle cx="100" cy="100" r="2" fill="var(--md-sys-color-on-primary)" />
      </svg>
    </motion.div>
  );
}

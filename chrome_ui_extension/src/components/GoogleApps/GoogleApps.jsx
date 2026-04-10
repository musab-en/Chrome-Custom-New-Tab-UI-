import React from 'react';
import { motion } from 'framer-motion';
import './GoogleApps.css';

const GOOGLE_APPS = [
  { name: 'Gmail', url: 'https://mail.google.com', color: '#EA4335', icon: '✉' },
  { name: 'Drive', url: 'https://drive.google.com', color: '#FBBC05', icon: '△' },
  { name: 'Docs', url: 'https://docs.google.com', color: '#4285F4', icon: '📄' },
  { name: 'Sheets', url: 'https://sheets.google.com', color: '#34A853', icon: '📊' },
  { name: 'Slides', url: 'https://slides.google.com', color: '#FBBC05', icon: '📑' },
  { name: 'Calendar', url: 'https://calendar.google.com', color: '#4285F4', icon: '📅' },
  { name: 'Photos', url: 'https://photos.google.com', color: '#EA4335', icon: '🖼' },
  { name: 'Maps', url: 'https://maps.google.com', color: '#34A853', icon: '🗺' },
  { name: 'YouTube', url: 'https://youtube.com', color: '#FF0000', icon: '▶' },
  { name: 'Keep', url: 'https://keep.google.com', color: '#FBBC05', icon: '📝' },
  { name: 'Translate', url: 'https://translate.google.com', color: '#4285F4', icon: '🌐' },
  { name: 'Meet', url: 'https://meet.google.com', color: '#34A853', icon: '📹' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.5 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function GoogleApps() {
  return (
    <motion.div
      className="google-apps"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="google-apps-title">Google Apps</div>
      <div className="google-apps-grid">
        {GOOGLE_APPS.map((app) => (
          <motion.a
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="google-app-tile"
            variants={itemVariants}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="google-app-icon" style={{ background: `${app.color}20`, color: app.color }}>
              {app.icon}
            </div>
            <span className="google-app-name">{app.name}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

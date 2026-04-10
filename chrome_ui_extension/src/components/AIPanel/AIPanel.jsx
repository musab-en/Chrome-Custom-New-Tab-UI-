import React from 'react';
import { motion } from 'framer-motion';
import './AIPanel.css';

const AI_TOOLS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', color: '#10A37F', icon: 'GPT' },
  { name: 'Gemini', url: 'https://gemini.google.com', color: '#4285F4', icon: '✦' },
  { name: 'Claude', url: 'https://claude.ai', color: '#CC785C', icon: 'C' },
  { name: 'Perplexity', url: 'https://perplexity.ai', color: '#20B2AA', icon: 'P' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', color: '#4A90D9', icon: 'DS' },
  { name: 'Copilot', url: 'https://copilot.microsoft.com', color: '#0078D4', icon: 'Co' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.4 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function AIPanel() {
  return (
    <motion.div
      className="ai-panel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="ai-panel-title">AI Tools</div>
      <div className="ai-grid">
        {AI_TOOLS.map((tool) => (
          <motion.a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-tile"
            variants={itemVariants}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="ai-tile-icon" style={{ background: tool.color }}>
              {tool.icon}
            </div>
            <span className="ai-tile-name">{tool.name}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

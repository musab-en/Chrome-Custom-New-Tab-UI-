import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore from '../../stores/useSettingsStore';
import './TodoManager.css';

export default function TodoManager() {
  const { autoClearTodos } = useSettingsStore();
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (autoClearTodos) {
      const lastClear = localStorage.getItem('easenmia-todo-lastclear');
      const today = new Date().toDateString();
      if (lastClear !== today) {
        setTodos(prev => {
          const kept = prev.filter(t => t.pinned || !t.completed);
          const reset = kept.map(t => t.pinned ? { ...t, completed: false } : t);
          saveTodos(reset);
          return reset;
        });
        localStorage.setItem('easenmia-todo-lastclear', today);
      }
    }
  }, [autoClearTodos]);

  const loadTodos = () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['todos'], (result) => {
          if (result.todos) setTodos(result.todos);
        });
      } else {
        const saved = localStorage.getItem('easenmia-todos');
        if (saved) setTodos(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load todos:', e);
    }
  };

  const saveTodos = useCallback((newTodos) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ todos: newTodos });
      } else {
        localStorage.setItem('easenmia-todos', JSON.stringify(newTodos));
      }
    } catch (e) {
      console.warn('Failed to save todos:', e);
    }
  }, []);

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      pinned: false,
      createdAt: Date.now(),
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    saveTodos(updated);
    setInput('');
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    saveTodos(updated);
  };

  const togglePin = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t);
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <motion.div
      className="todo-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="todo-header">
        <span className="todo-title">Tasks</span>
        <span className="todo-count">{todos.filter(t => !t.completed).length} remaining</span>
      </div>

      <div className="todo-input-row">
        <input
          type="text"
          className="todo-input"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className="todo-add-btn" onClick={addTodo} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className="todo-list">
        <AnimatePresence>
          {sortedTodos.map((todo) => (
            <motion.div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.pinned ? 'pinned' : ''}`}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <button className="todo-check" onClick={() => toggleTodo(todo.id)}>
                {todo.completed ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--md-sys-color-primary)">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--md-sys-color-on-surface-variant)">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                )}
              </button>
              <span className="todo-text">{todo.text}</span>
              <div className="todo-actions">
                <button
                  className={`todo-pin-btn ${todo.pinned ? 'active' : ''}`}
                  onClick={() => togglePin(todo.id)}
                  title={todo.pinned ? 'Unpin' : 'Pin'}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                  </svg>
                </button>
                <button className="todo-delete-btn" onClick={() => deleteTodo(todo.id)} title="Delete">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sortedTodos.length === 0 && (
          <div className="todo-empty">No tasks yet. Add one above!</div>
        )}
      </div>
    </motion.div>
  );
}

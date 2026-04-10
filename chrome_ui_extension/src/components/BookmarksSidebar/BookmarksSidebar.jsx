import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookmarksSidebar.css';

export default function BookmarksSidebar({ isOpen, onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    if (isOpen) loadBookmarks();
  }, [isOpen]);

  const loadBookmarks = () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((tree) => {
          setBookmarks(tree[0]?.children || []);
        });
      }
    } catch (e) {
      console.warn('Failed to load bookmarks:', e);
    }
  };

  const deleteBookmark = (id) => {
    if (!confirm('Delete this bookmark?')) return;
    try {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.remove(id, () => loadBookmarks());
      }
    } catch (e) {
      console.warn('Failed to delete bookmark:', e);
    }
  };

  const toggleFolder = (id) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterBookmarks = useCallback((nodes) => {
    if (!searchQuery.trim()) return nodes;
    return nodes.reduce((acc, node) => {
      if (node.url && (node.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.url.toLowerCase().includes(searchQuery.toLowerCase()))) {
        acc.push(node);
      }
      if (node.children) {
        const filteredChildren = filterBookmarks(node.children);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  }, [searchQuery]);

  const renderNode = (node, depth = 0) => {
    if (node.url) {
      return (
        <motion.div
          key={node.id}
          className="bookmark-item"
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <a href={node.url} className="bookmark-link" target="_blank" rel="noopener noreferrer">
            <img
              className="bookmark-favicon"
              src={`chrome-extension://${typeof chrome !== 'undefined' ? chrome.runtime?.id : 'ext'}/_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=16`}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="bookmark-title">{node.title || node.url}</span>
          </a>
          <button className="bookmark-delete" onClick={() => deleteBookmark(node.id)} title="Delete">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </motion.div>
      );
    }

    if (node.children) {
      const isExpanded = expandedFolders.has(node.id) || searchQuery.trim().length > 0;
      const displayed = searchQuery.trim()
        ? filterBookmarks(node.children)
        : node.children;

      return (
        <div key={node.id} className="bookmark-folder">
          <button
            className="bookmark-folder-header"
            style={{ paddingLeft: `${depth * 16 + 16}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              className={`folder-arrow ${isExpanded ? 'expanded' : ''}`}
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--md-sys-color-primary)">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            <span>{node.title || 'Folder'}</span>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                {displayed.map(child => renderNode(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="bookmarks-sidebar"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="bookmarks-header">
              <h2>Bookmarks</h2>
              <button className="bookmarks-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="bookmarks-search">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="bookmarks-search-icon">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bookmarks-content">
              {bookmarks.length > 0 ? (
                (searchQuery.trim() ? filterBookmarks(bookmarks) : bookmarks).map(node => renderNode(node))
              ) : (
                <div className="bookmarks-empty">No bookmarks found</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

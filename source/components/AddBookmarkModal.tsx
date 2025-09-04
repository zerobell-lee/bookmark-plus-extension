import React, { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { useBookmarks } from '../context/BookmarkContext';
import TagInput from './TagInput';
import './AddBookmarkModal.scss';

interface AddBookmarkModalProps {
  currentFolderId: string;
  onClose: () => void;
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ currentFolderId, onClose }) => {
  const { state, addBookmark } = useBookmarks();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getCurrentTabInfo = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.title) {
          setUrl(tab.url);
          setTitle(tab.title);
        }
      } catch (error) {
        console.error('Failed to get current tab info:', error);
      }
    };

    getCurrentTabInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBookmark();
  };

  const saveBookmark = async () => {
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!url.trim()) {
        throw new Error('URL is required');
      }

      await addBookmark(title.trim(), url.trim(), selectedFolderId, tags);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter 또는 Ctrl+Enter로 저장
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveBookmark();
    }
  };


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFolderPath = (folderId: string): string => {
    const folder = state.folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown';
    
    if (folder.parentId) {
      const parentPath = getFolderPath(folder.parentId);
      // 루트(/)인 경우 특별 처리
      if (parentPath === '/') {
        return `/${folder.name}`;
      }
      return `${parentPath}/${folder.name}`;
    }
    return folder.name;
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container add-bookmark-modal">
        <div className="modal-header">
          <h2>&#43; Add Bookmark</h2>
          <button className="modal-close-btn" onClick={onClose}>&#10006;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="bookmark-title">Title *</label>
            <input
              id="bookmark-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveBookmark();
                }
                handleKeyDown(e);
              }}
              placeholder="Bookmark title"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookmark-url">URL *</label>
            <input
              id="bookmark-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveBookmark();
                }
                handleKeyDown(e);
              }}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookmark-folder">Folder</label>
            <select
              id="bookmark-folder"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveBookmark();
                }
                handleKeyDown(e);
              }}
            >
              {state.folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {getFolderPath(folder.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bookmark-tags">Tags</label>
            <TagInput
              tags={tags}
              allTags={Array.from(state.tags)}
              onChange={setTags}
              placeholder="Type to add tags..."
              onSave={saveBookmark}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="keyboard-shortcuts-hint">
            <small>💡 Tip: Press <kbd>Enter</kbd> on empty tag input to save quickly</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary enhanced-save-btn">
              {loading ? '💾 Adding...' : '💾 Add Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkModal;
import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Bookmark } from '../types/Bookmark';
import TagInput from './TagInput';
import './EditBookmarkModal.scss';

interface EditBookmarkModalProps {
  bookmark: Bookmark;
  onClose: () => void;
}

const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({ bookmark, onClose }) => {
  const { state, bookmarkManager, loadData, removeTagFromBookmark } = useBookmarks();
  const [title, setTitle] = useState(bookmark.title);
  const [tags, setTags] = useState(bookmark.tags);
  const [selectedFolderId, setSelectedFolderId] = useState(bookmark.folderId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      // Update bookmark data
      const updatedBookmark: Bookmark = {
        ...bookmark,
        title: title.trim(),
        tags: tags,
        folderId: selectedFolderId,
        dateUpdated: new Date().toISOString()
      };

      // Find and update in the manager's internal array
      const bookmarks = bookmarkManager.getBookmarks();
      const index = bookmarks.findIndex(b => b.id === bookmark.id);
      if (index !== -1) {
        bookmarks[index] = updatedBookmark;
        
        // Update tags in manager
        tags.forEach(tag => {
          if (!bookmarkManager.getAllTags().includes(tag)) {
            bookmarkManager.getAllTags().push(tag);
          }
        });

        // Save to storage
        await bookmarkManager['saveBookmarks']();
        await bookmarkManager['saveTags']();
        
        // Reload context data
        await loadData();
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Cmd+Enter or Ctrl+Enter
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
      // Handle root path (/) case
      if (parentPath === '/') {
        return `/${folder.name}`;
      }
      return `${parentPath}/${folder.name}`;
    }
    return folder.name;
  };

  const addQuickTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Handle immediate tag removal
  const handleTagRemove = async (tag: string) => {
    try {
      await removeTagFromBookmark(bookmark.id, tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  // Recommend frequently used tags from existing tags
  const suggestedTags = Array.from(state.tags)
    .filter(tag => !tags.includes(tag))
    .slice(0, 6);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container edit-bookmark-modal">
        <div className="modal-header">
          <h2>✏️ Edit Bookmark</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
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
            <label htmlFor="bookmark-url">URL</label>
            <input
              id="bookmark-url"
              type="url"
              value={bookmark.url}
              disabled
              className="disabled-input"
            />
            <small className="form-help">URL cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="bookmark-folder">Folder</label>
            <select
              id="bookmark-folder-edit"
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
              onRemoveTag={handleTagRemove}
              placeholder="Type to add tags..."
              onSave={saveBookmark}
            />
            
            {suggestedTags.length > 0 && (
              <div className="suggested-tags">
                <span className="tags-label">Quick add:</span>
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-suggestion"
                    onClick={() => addQuickTag(tag)}
                    title={`Add ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
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
              {loading ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookmarkModal;
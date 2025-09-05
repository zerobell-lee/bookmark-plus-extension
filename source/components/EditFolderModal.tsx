import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Folder } from '../types/Bookmark';
import './EditFolderModal.scss';

interface EditFolderModalProps {
  folder: Folder;
  onClose: () => void;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({ folder, onClose }) => {
  const { updateFolder } = useBookmarks();
  const [name, setName] = useState(folder.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFolder();
  };

  const saveFolder = async () => {
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Folder name is required');
      }

      if (name.trim() === folder.name) {
        onClose();
        return;
      }

      await updateFolder(folder.id, name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveFolder();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container edit-folder-modal">
        <div className="modal-header">
          <h2>✏️ Edit Folder</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="folder-name">Folder Name *</label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveFolder();
                }
                handleKeyDown(e);
              }}
              placeholder="Folder name"
              required
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="keyboard-shortcuts-hint">
            <small>💡 Tip: Press <kbd>Cmd+Enter</kbd> or <kbd>Ctrl+Enter</kbd> to save quickly</small>
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

export default EditFolderModal;
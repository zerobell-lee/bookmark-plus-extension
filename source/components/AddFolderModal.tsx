import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import './AddFolderModal.scss';

interface AddFolderModalProps {
  currentFolderId: string;
  onClose: () => void;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ currentFolderId, onClose }) => {
  const { state, addFolder } = useBookmarks();
  const [name, setName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(currentFolderId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Folder name is required');
      }

      const existingFolder = state.folders.find(
        folder => folder.name.toLowerCase() === name.trim().toLowerCase() && 
                 folder.parentId === selectedParentId
      );
      
      if (existingFolder) {
        throw new Error('A folder with this name already exists in the selected location');
      }
      
      await addFolder(name.trim(), selectedParentId);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create folder');
    } finally {
      setLoading(false);
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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container add-folder-modal">
        <div className="modal-header">
          <h2>&#128193; Add Folder</h2>
          <button className="modal-close-btn" onClick={onClose}>&#10006;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="folder-name">Folder Name *</label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New folder name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent-folder">Parent Folder</label>
            <select
              id="parent-folder"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
            >
              {state.folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {getFolderPath(folder.id)}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
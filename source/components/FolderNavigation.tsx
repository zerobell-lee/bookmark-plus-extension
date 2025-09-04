import React from 'react';
import { Folder } from '../types/Bookmark';
import './FolderNavigation.scss';

interface FolderNavigationProps {
  currentFolderId: string;
  folders: Folder[];
  onFolderClick: (folderId: string) => void;
}

const FolderNavigation: React.FC<FolderNavigationProps> = ({
  currentFolderId,
  folders,
  onFolderClick
}) => {
  const buildBreadcrumb = (): Array<{id: string; name: string}> => {
    const breadcrumb: Array<{id: string; name: string}> = [];
    let currentId = currentFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      
      breadcrumb.unshift({
        id: folder.id,
        name: folder.name
      });
      
      currentId = folder.parentId || '';
    }
    
    return breadcrumb;
  };

  const breadcrumb = buildBreadcrumb();
  
  if (breadcrumb.length <= 1) {
    return null;
  }

  return (
    <div className="folder-navigation">
      <div className="breadcrumb">
        {breadcrumb.map((folder, index) => (
          <React.Fragment key={folder.id}>
            {index > 0 && <span className="breadcrumb-separator">&#8250;</span>}
            <button
              className={`breadcrumb-item ${folder.id === currentFolderId ? 'current' : ''}`}
              onClick={() => onFolderClick(folder.id)}
              disabled={folder.id === currentFolderId}
            >
              {index === 0 ? '🏠' : ''} {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>
      
      {currentFolderId !== 'root' && (
        <button 
          className="up-button"
          onClick={() => {
            const currentFolder = folders.find(f => f.id === currentFolderId);
            if (currentFolder && currentFolder.parentId) {
              onFolderClick(currentFolder.parentId);
            }
          }}
          title="Go to parent folder"
        >
          &#8593; Up
        </button>
      )}
    </div>
  );
};

export default FolderNavigation;
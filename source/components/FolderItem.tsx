import React from 'react';
import { Folder } from '../types/Bookmark';
import { useBookmarks } from '../context/BookmarkContext';
import './FolderItem.scss';

interface FolderItemProps {
  folder: Folder;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, onClick, onRightClick }) => {
  const { state } = useBookmarks();

  const getBookmarkCount = (): number => {
    return state.bookmarks.filter(bookmark => bookmark.folderId === folder.id).length;
  };

  const getSubfolderCount = (): number => {
    return state.folders.filter(f => f.parentId === folder.id).length;
  };

  const bookmarkCount = getBookmarkCount();
  const subfolderCount = getSubfolderCount();

  return (
    <div 
      className="folder-item"
      onClick={onClick}
      onContextMenu={onRightClick}
      title={`${folder.name}\n${bookmarkCount} bookmarks, ${subfolderCount} subfolders`}
    >
      <div className="folder-icon">
        &#128193;
      </div>
      
      <div className="folder-content">
        <div className="folder-name">{folder.name}</div>
        <div className="folder-stats">
          {bookmarkCount > 0 && (
            <span className="bookmark-count">
              {bookmarkCount} &#128279;
            </span>
          )}
          {subfolderCount > 0 && (
            <span className="subfolder-count">
              {subfolderCount} &#128193;
            </span>
          )}
          {bookmarkCount === 0 && subfolderCount === 0 && (
            <span className="empty-folder">Empty</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderItem;
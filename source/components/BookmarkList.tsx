import React, { useState } from 'react';
import { Bookmark, Folder } from '../types/Bookmark';
import BookmarkItem from './BookmarkItem';
import FolderItem from './FolderItem';
import TagCloud from './TagCloud';
import './BookmarkList.scss';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  onRightClick: (e: React.MouseEvent, item: Bookmark | Folder, type: 'bookmark' | 'folder') => void;
  onFolderClick: (folderId: string) => void;
  currentView: 'folder' | 'tag';
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  allTags: Set<string>;
  onReorderBookmarks?: (fromIndex: number, toIndex: number) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  folders,
  onRightClick,
  onFolderClick,
  currentView,
  selectedTags,
  onTagToggle,
  allTags,
  onReorderBookmarks
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, bookmark: Bookmark) => {
    e.dataTransfer.setData('text/plain', bookmark.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (_e: React.DragEvent, bookmark: Bookmark) => {
    const index = bookmarks.findIndex(b => b.id === bookmark.id);
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, bookmark: Bookmark) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedIndex = bookmarks.findIndex(b => b.id === draggedId);
    const dropIndex = bookmarks.findIndex(b => b.id === bookmark.id);
    
    if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
      onReorderBookmarks?.(draggedIndex, dropIndex);
    }
    
    setDragOverIndex(null);
  };
  if (currentView === 'tag') {
    return (
      <div className="bookmark-list">
        <TagCloud 
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
        />
        <div className="bookmark-items">
          {bookmarks.length === 0 ? (
            <div className="empty-message">
              &#128279; No bookmarks found with selected tags
            </div>
          ) : (
            bookmarks.map((bookmark, index) => (
              <BookmarkItem
                key={bookmark.id}
                bookmark={bookmark}
                onRightClick={(e) => onRightClick(e, bookmark, 'bookmark')}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragOver={dragOverIndex === index}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-list">
      <div className="folder-items">
        {folders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            onClick={() => onFolderClick(folder.id)}
            onRightClick={(e) => onRightClick(e, folder, 'folder')}
          />
        ))}
      </div>
      
      <div className="bookmark-items">
        {bookmarks.length === 0 && folders.length === 0 ? (
          <div className="empty-message">
            &#128279; No bookmarks or folders in this location
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-message">
            &#128279; No bookmarks in this folder
          </div>
        ) : (
          bookmarks.map((bookmark, index) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onRightClick={(e) => onRightClick(e, bookmark, 'bookmark')}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverIndex === index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BookmarkList;
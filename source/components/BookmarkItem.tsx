import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Bookmark } from '../types/Bookmark';
import { useBookmarks } from '../context/BookmarkContext';
import './BookmarkItem.scss';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onRightClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent, bookmark: Bookmark) => void;
  onDragOver?: (e: React.DragEvent, bookmark: Bookmark) => void;
  onDrop?: (e: React.DragEvent, bookmark: Bookmark) => void;
  isDragOver?: boolean;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ 
  bookmark, 
  onRightClick, 
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver = false
}) => {
  const { updateBookmarkOnVisit } = useBookmarks();

  const handleClick = async (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      e.preventDefault();
      
      try {
        await updateBookmarkOnVisit(bookmark.id);
        await browser.tabs.create({ url: bookmark.url });
      } catch (error) {
        console.error('Failed to open bookmark:', error);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div 
      className={`bookmark-item ${isDragOver ? 'drag-over' : ''}`}
      onClick={handleClick}
      onContextMenu={onRightClick}
      draggable
      onDragStart={(e) => onDragStart?.(e, bookmark)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, bookmark);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, bookmark);
      }}
      title={`${bookmark.title}\n${bookmark.url}\nVisited: ${bookmark.visitCount} times\nAdded: ${formatDate(bookmark.dateAdded)}`}
    >
      <div className="bookmark-favicon">
        {bookmark.favicon ? (
          <img 
            src={bookmark.favicon} 
            alt=""
            className="favicon-img"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '&#128279;';
            }}
          />
        ) : (
          <span className="default-favicon">&#128279;</span>
        )}
      </div>
      
      <div className="bookmark-content">
        <div className="bookmark-title">{bookmark.title}</div>
        <div className="bookmark-url">{formatUrl(bookmark.url)}</div>
        
        {bookmark.tags.length > 0 && (
          <div className="bookmark-tags">
            {bookmark.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="bookmark-meta">
        {bookmark.visitCount > 0 && (
          <span className="visit-count" title={`Visited ${bookmark.visitCount} times`}>
            {bookmark.visitCount}&#128065;
          </span>
        )}
      </div>
    </div>
  );
};

export default BookmarkItem;
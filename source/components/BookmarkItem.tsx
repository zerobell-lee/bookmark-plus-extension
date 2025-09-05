import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Bookmark } from '../types/Bookmark';
import { useBookmarks } from '../context/BookmarkContext';
import './BookmarkItem.scss';

interface BookmarkItemProps {
  bookmark: Bookmark;
  viewMode: 'compact' | 'detailed';
  onRightClick: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent, bookmark: Bookmark) => void;
  onDragOver?: (e: React.DragEvent, bookmark: Bookmark) => void;
  onDrop?: (e: React.DragEvent, bookmark: Bookmark) => void;
  isDragOver?: boolean;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ 
  bookmark, 
  viewMode,
  onRightClick, 
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver = false
}) => {
  const { updateBookmarkOnVisit } = useBookmarks();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle click
      e.preventDefault();
      handleMiddleClick();
    } else if (e.button === 0) { // Left click
      setDragStartTime(Date.now());
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    // Only handle click if it wasn't a drag
    if (e.button === 0 && !isDragging) {
      const clickTime = Date.now() - dragStartTime;
      // If mouse was held down for less than 200ms, treat as click
      if (clickTime < 200) {
        e.preventDefault();
        
        try {
          await updateBookmarkOnVisit(bookmark.id);
          await browser.tabs.create({ url: bookmark.url });
        } catch (error) {
          console.error('Failed to open bookmark:', error);
        }
      }
    }
  };

  const handleMiddleClick = async () => {
    try {
      await updateBookmarkOnVisit(bookmark.id);
      await browser.tabs.create({ url: bookmark.url, active: false });
    } catch (error) {
      console.error('Failed to open bookmark in background tab:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(e, bookmark);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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
      className={`bookmark-item ${viewMode === 'detailed' ? 'detailed-view' : 'compact-view'} ${isDragOver ? 'drag-over' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={onRightClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, bookmark);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, bookmark);
      }}
      title={`${bookmark.title}\n${bookmark.url}\nLeft click: Open in current tab\nMiddle click: Open in new background tab\nAdded: ${formatDate(bookmark.dateAdded)}`}
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

        {/* Rich Preview for OpenGraph data - only in detailed view */}
        {viewMode === 'detailed' && bookmark.hasRichPreview && bookmark.openGraph && (
          <div className="bookmark-rich-preview">
            {bookmark.openGraph.image && (
              <div className="rich-preview-image">
                <img 
                  src={bookmark.openGraph.image}
                  alt="Preview"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="rich-preview-content">
              {bookmark.openGraph.description && (
                <div className="rich-preview-description">
                  {bookmark.openGraph.description}
                </div>
              )}
              {bookmark.openGraph.siteName && (
                <div className="rich-preview-site">
                  {bookmark.openGraph.siteName}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="bookmark-meta">
        {/* Visit count is tracked internally but not displayed */}
      </div>
    </div>
  );
};

export default BookmarkItem;
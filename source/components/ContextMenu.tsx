import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Bookmark, Folder } from '../types/Bookmark';
import { useBookmarks } from '../context/BookmarkContext';
import './ContextMenu.scss';

interface ContextMenuProps {
  x: number;
  y: number;
  target: Bookmark | Folder;
  type: 'bookmark' | 'folder';
  onClose: () => void;
  onEdit?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, target, type, onClose, onEdit }) => {
  const { deleteBookmark, deleteFolder, refreshFavicon } = useBookmarks();

  // Auto-adjust menu position within viewport
  const getAdjustedPosition = () => {
    const menuWidth = 160;
    const menuHeight = type === 'bookmark' ? 200 : 60; // Bookmark has 6 items, folder has 1 item
    const padding = 8;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Move to left if overflowing to the right
    if (x + menuWidth > viewportWidth - padding) {
      adjustedX = x - menuWidth;
    }
    
    // Move upward if overflowing downward
    if (y + menuHeight > viewportHeight - padding) {
      adjustedY = y - menuHeight;
    }
    
    // Minimum value correction
    adjustedX = Math.max(padding, adjustedX);
    adjustedY = Math.max(padding, adjustedY);
    
    return { x: adjustedX, y: adjustedY };
  };

  const adjustedPosition = getAdjustedPosition();

  const handleAction = async (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      switch (action) {
        case 'delete':
          const confirmMessage = type === 'bookmark' 
            ? `Are you sure you want to delete the bookmark "${(target as Bookmark).title}"?`
            : `Are you sure you want to delete the folder "${(target as Folder).name}" and all its contents?`;
          
          if (confirm(confirmMessage)) {
            if (type === 'bookmark') {
              await deleteBookmark(target.id);
            } else {
              await deleteFolder(target.id);
            }
          }
          break;

        case 'refresh-favicon':
          if (type === 'bookmark') {
            const success = await refreshFavicon(target.id);
            if (success) {
              alert('Favicon refreshed successfully!');
            } else {
              alert('Failed to refresh favicon');
            }
          }
          break;

        case 'copy-url':
          if (type === 'bookmark') {
            try {
              await navigator.clipboard.writeText((target as Bookmark).url);
              alert('URL copied to clipboard!');
            } catch (error) {
              prompt('Copy this URL:', (target as Bookmark).url);
            }
          }
          break;

        case 'open-new-tab':
          if (type === 'bookmark') {
            await browser.tabs.create({ url: (target as Bookmark).url });
          }
          break;

        case 'edit':
          if (type === 'bookmark' && onEdit) {
            onEdit();
            return; // onClose is handled in onEdit, so return here
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Failed to ${action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      onClose();
    }
  };

  return (
    <div 
      className="context-menu"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {type === 'bookmark' && (
        <>
          <button 
            className="context-menu-item"
            onClick={(e) => handleAction('open-new-tab', e)}
          >
            &#128279; Open in New Tab
          </button>
          <button 
            className="context-menu-item"
            onClick={(e) => handleAction('copy-url', e)}
          >
            &#128203; Copy URL
          </button>
          <div className="context-menu-separator"></div>
          <button 
            className="context-menu-item"
            onClick={(e) => handleAction('edit', e)}
          >
            ✏️ Edit Bookmark
          </button>
          <button 
            className="context-menu-item"
            onClick={(e) => handleAction('refresh-favicon', e)}
          >
            &#128472; Refresh Favicon
          </button>
          <div className="context-menu-separator"></div>
        </>
      )}
      
      <button 
        className="context-menu-item danger"
        onClick={(e) => handleAction('delete', e)}
      >
        &#128465; Delete {type === 'bookmark' ? 'Bookmark' : 'Folder'}
      </button>
    </div>
  );
};

export default ContextMenu;
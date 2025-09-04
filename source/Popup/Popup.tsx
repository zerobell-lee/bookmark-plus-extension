import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Bookmark, Folder } from '../types/Bookmark';
import BookmarkList from '../components/BookmarkList';
import FolderNavigation from '../components/FolderNavigation';
import SearchBar from '../components/SearchBar';
import AddBookmarkModal from '../components/AddBookmarkModal';
import AddFolderModal from '../components/AddFolderModal';
import EditBookmarkModal from '../components/EditBookmarkModal';
import ContextMenu from '../components/ContextMenu';
import './styles.scss';

const Popup: React.FC = () => {
  const {
    state,
    setCurrentFolder,
    setView,
    setSelectedTags,
    setSearchQuery,
    exportBookmarks,
    importBookmarks,
    reorderBookmarks
  } = useBookmarks();

  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    target: Bookmark | Folder | null;
    type: 'bookmark' | 'folder' | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    target: null,
    type: null
  });

  const handleRightClick = (e: React.MouseEvent, item: Bookmark | Folder, type: 'bookmark' | 'folder') => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      target: item,
      type
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      show: false,
      x: 0,
      y: 0,
      target: null,
      type: null
    });
  };

  const getCurrentFolderBookmarks = (): Bookmark[] => {
    if (state.currentView === 'tag') {
      return state.bookmarks.filter(bookmark => 
        state.selectedTags.size === 0 || 
        bookmark.tags.some(tag => state.selectedTags.has(tag))
      );
    }
    
    return state.bookmarks.filter(bookmark => bookmark.folderId === state.currentFolderId);
  };

  const getCurrentFolderSubfolders = (): Folder[] => {
    return state.folders.filter(folder => folder.parentId === state.currentFolderId);
  };

  const getFilteredBookmarks = (): Bookmark[] => {
    let bookmarks = getCurrentFolderBookmarks();
    
    if (state.searchQuery) {
      bookmarks = bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      );
    }
    
    return bookmarks;
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = await importBookmarks(jsonData, { merge: false, validateVersion: true });
        
        if (result.success) {
          alert(`Import successful! Imported ${result.imported?.bookmarks || 0} bookmarks, ${result.imported?.folders || 0} folders, ${result.imported?.tags || 0} tags.`);
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        alert('Import failed: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        hideContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.show]);

  return (
    <div className="popup-container" onClick={hideContextMenu}>
      <div className="popup-header">
        <h1 className="popup-title">
          <img src="assets/icons/favicon-32.png" alt="Bookmark+" className="popup-favicon" />
          Bookmark+
        </h1>
        <div className="popup-controls">
          <button 
            className="btn-primary" 
            onClick={() => setShowAddBookmarkModal(true)}
            title="Add Bookmark"
          >
            &#43;
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setShowAddFolderModal(true)}
            title="Add Folder"
          >
            &#128193;
          </button>
          <div className="import-export-controls">
            <button 
              className="btn-secondary" 
              onClick={exportBookmarks}
              title="Export Bookmarks"
            >
              &#8595;
            </button>
            <label className="btn-secondary import-label" title="Import Bookmarks">
              &#8593;
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      <SearchBar 
        searchQuery={state.searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="view-switcher">
        <button 
          className={`view-btn ${state.currentView === 'folder' ? 'active' : ''}`}
          onClick={() => setView('folder')}
        >
          &#128193; Folders
        </button>
        <button 
          className={`view-btn ${state.currentView === 'tag' ? 'active' : ''}`}
          onClick={() => setView('tag')}
        >
          &#127991; Tags
        </button>
      </div>

      {state.currentView === 'folder' && (
        <FolderNavigation 
          currentFolderId={state.currentFolderId}
          folders={state.folders}
          onFolderClick={setCurrentFolder}
        />
      )}

      <BookmarkList 
        bookmarks={getFilteredBookmarks()}
        folders={getCurrentFolderSubfolders()}
        onRightClick={handleRightClick}
        onFolderClick={setCurrentFolder}
        currentView={state.currentView}
        selectedTags={state.selectedTags}
        onTagToggle={(tag) => {
          const newSelectedTags = new Set(state.selectedTags);
          if (newSelectedTags.has(tag)) {
            newSelectedTags.delete(tag);
          } else {
            newSelectedTags.add(tag);
          }
          setSelectedTags(newSelectedTags);
        }}
        allTags={state.tags}
        onReorderBookmarks={reorderBookmarks}
      />

      {showAddBookmarkModal && (
        <AddBookmarkModal
          currentFolderId={state.currentFolderId}
          onClose={() => setShowAddBookmarkModal(false)}
        />
      )}

      {showAddFolderModal && (
        <AddFolderModal
          currentFolderId={state.currentFolderId}
          onClose={() => setShowAddFolderModal(false)}
        />
      )}

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
        />
      )}

      {contextMenu.show && contextMenu.target && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          type={contextMenu.type!}
          onClose={hideContextMenu}
          onEdit={() => {
            if (contextMenu.type === 'bookmark' && contextMenu.target) {
              setEditingBookmark(contextMenu.target as Bookmark);
              hideContextMenu();
            }
          }}
        />
      )}
    </div>
  );
};

export default Popup;

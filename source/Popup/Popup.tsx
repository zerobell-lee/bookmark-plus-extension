import React, { useState, useEffect, useMemo } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { useBookmarks } from '../context/BookmarkContext';
import { Bookmark, Folder, SearchResult } from '../types/Bookmark';
import BookmarkList from '../components/BookmarkList';
import FolderNavigation from '../components/FolderNavigation';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import AddBookmarkModal from '../components/AddBookmarkModal';
import AddFolderModal from '../components/AddFolderModal';
import EditBookmarkModal from '../components/EditBookmarkModal';
import EditFolderModal from '../components/EditFolderModal';
import ContextMenu from '../components/ContextMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import '../components/ThemeToggle.scss';
import './styles.scss';

const Popup: React.FC = () => {
  const {
    state,
    setCurrentFolder,
    setView,
    setViewMode,
    setSelectedTags,
    setSearchQuery,
    exportBookmarks,
    importBookmarks,
    reorderBookmarks,
    globalSearch
  } = useBookmarks();

  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
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

  const handleBookmarkClick = async (url: string, inBackground: boolean = false) => {
    // Open bookmark in new tab
    try {
      await browser.tabs.create({ url, active: !inBackground });
    } catch (error) {
      console.error('Failed to open bookmark:', error);
      window.open(url, '_blank');
    }
  };

  const handleSearchResultRightClick = (e: React.MouseEvent, searchResult: SearchResult) => {
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      target: searchResult.bookmark,
      type: 'bookmark'
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

  // Use global search when there's a search query
  const searchResults: SearchResult[] = useMemo(() => {
    if (state.searchQuery && state.searchQuery.trim().length > 0) {
      return globalSearch(state.searchQuery);
    }
    return [];
  }, [state.searchQuery, globalSearch]);

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
          <ThemeToggle className="theme-toggle-compact" size="small" />
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

      <div className="view-controls">
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
        
        <div className="view-mode-switcher">
          <button 
            className={`view-mode-btn ${state.viewMode === 'compact' ? 'active' : ''}`}
            onClick={() => setViewMode('compact')}
            title="Compact View"
          >
            &#9776;
          </button>
          <button 
            className={`view-mode-btn ${state.viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
            title="Detailed View"
          >
            &#9783;
          </button>
        </div>
      </div>

      <div className="popup-content">
        {!state.searchQuery && state.currentView === 'folder' && (
          <FolderNavigation 
            currentFolderId={state.currentFolderId}
            folders={state.folders}
            onFolderClick={setCurrentFolder}
          />
        )}

        {/* Show SearchResults when searching, otherwise show BookmarkList */}
        {state.searchQuery && searchResults.length > 0 ? (
          <SearchResults 
            results={searchResults}
            onBookmarkClick={handleBookmarkClick}
            onBookmarkRightClick={handleSearchResultRightClick}
          />
        ) : state.searchQuery && searchResults.length === 0 ? (
          <SearchResults 
            results={[]}
            onBookmarkClick={handleBookmarkClick}
            onBookmarkRightClick={handleSearchResultRightClick}
          />
        ) : (
          <BookmarkList 
            bookmarks={getFilteredBookmarks()}
            folders={getCurrentFolderSubfolders()}
            onRightClick={handleRightClick}
            onFolderClick={setCurrentFolder}
            currentView={state.currentView}
            viewMode={state.viewMode}
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
        )}
      </div>

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

      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
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
          onEditFolder={() => {
            if (contextMenu.type === 'folder' && contextMenu.target) {
              setEditingFolder(contextMenu.target as Folder);
              hideContextMenu();
            }
          }}
        />
      )}
    </div>
  );
};

export default Popup;

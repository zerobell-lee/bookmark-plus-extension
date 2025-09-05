import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BookmarkState, Bookmark, Folder, SearchResult } from '../types/Bookmark';
import { BookmarkManager } from '../services/BookmarkManager';

// Initial state
const initialState: BookmarkState = {
  bookmarks: [],
  folders: [],
  tags: new Set(),
  currentFolderId: 'root',
  currentView: 'folder',
  viewMode: 'compact',
  selectedTags: new Set(),
  searchQuery: '',
};

// Action types
type BookmarkAction = 
  | { type: 'LOAD_DATA'; payload: { bookmarks: Bookmark[]; folders: Folder[]; tags: Set<string> } }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'DELETE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_BOOKMARK'; payload: Bookmark }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_VIEW'; payload: 'folder' | 'tag' }
  | { type: 'SET_VIEW_MODE'; payload: 'compact' | 'detailed' }
  | { type: 'SET_SELECTED_TAGS'; payload: Set<string> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'CLEANUP_ORPHANED_TAGS'; payload: Set<string> };

// Reducer
function bookmarkReducer(state: BookmarkState, action: BookmarkAction): BookmarkState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        bookmarks: action.payload.bookmarks,
        folders: action.payload.folders,
        tags: action.payload.tags,
      };

    case 'ADD_BOOKMARK':
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload],
        tags: new Set([...Array.from(state.tags), ...action.payload.tags]),
      };

    case 'DELETE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(b => b.id !== action.payload),
      };

    case 'UPDATE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.map(b => 
          b.id === action.payload.id ? action.payload : b
        ),
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...state.folders, action.payload],
      };

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(f => f.id !== action.payload),
        bookmarks: state.bookmarks.filter(b => b.folderId !== action.payload),
      };

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map(f => 
          f.id === action.payload.id ? action.payload : f
        ),
      };

    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        currentFolderId: action.payload,
      };

    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_SELECTED_TAGS':
      return {
        ...state,
        selectedTags: action.payload,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'ADD_TAG':
      return {
        ...state,
        tags: new Set([...Array.from(state.tags), action.payload]),
      };

    case 'REMOVE_TAG':
      const newTags = new Set(state.tags);
      newTags.delete(action.payload);
      return {
        ...state,
        tags: newTags,
      };

    case 'CLEANUP_ORPHANED_TAGS':
      return {
        ...state,
        tags: action.payload,
      };

    default:
      return state;
  }
}

// Context
interface BookmarkContextType {
  state: BookmarkState;
  dispatch: React.Dispatch<BookmarkAction>;
  bookmarkManager: BookmarkManager;
  // Actions
  loadData: () => Promise<void>;
  addBookmark: (title: string, url: string, folderId?: string, tags?: string[]) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  addFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  setCurrentFolder: (folderId: string) => void;
  setView: (view: 'folder' | 'tag') => void;
  setViewMode: (mode: 'compact' | 'detailed') => void;
  setSelectedTags: (tags: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  addTagToBookmark: (bookmarkId: string, tag: string) => Promise<void>;
  removeTagFromBookmark: (bookmarkId: string, tag: string) => Promise<void>;
  refreshFavicon: (bookmarkId: string) => Promise<boolean>;
  refreshOpenGraph: (bookmarkId: string) => Promise<boolean>;
  updateBookmarkOnVisit: (bookmarkId: string) => Promise<void>;
  reorderBookmarks: (fromIndex: number, toIndex: number) => Promise<void>;
  exportBookmarks: () => void;
  importBookmarks: (jsonData: string, options?: { merge: boolean; validateVersion: boolean }) => Promise<any>;
  globalSearch: (query: string) => SearchResult[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// Provider component
interface BookmarkProviderProps {
  children: ReactNode;
}

// Global BookmarkManager instance (singleton pattern)
let globalBookmarkManager: BookmarkManager | null = null;

const getBookmarkManager = (): BookmarkManager => {
  if (!globalBookmarkManager) {
    globalBookmarkManager = new BookmarkManager();
  }
  return globalBookmarkManager;
};

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);
  const bookmarkManager = getBookmarkManager();

  // Load initial data
  const loadData = async () => {
    await bookmarkManager.init();
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        bookmarks: bookmarkManager.getBookmarks(),
        folders: bookmarkManager.getFolders(),
        tags: new Set(bookmarkManager.getAllTags()),
      }
    });
  };

  // Actions
  const addBookmark = async (title: string, url: string, folderId: string = 'root', tags: string[] = []) => {
    try {
      await bookmarkManager.createBookmark(title, url, folderId, tags);
      // Reload context since BookmarkManager has already saved
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const deleteBookmark = async (id: string) => {
    const success = bookmarkManager.deleteBookmark(id);
    if (success) {
      dispatch({ type: 'DELETE_BOOKMARK', payload: id });
      // Update tags after cleanup
      dispatch({ type: 'CLEANUP_ORPHANED_TAGS', payload: new Set(bookmarkManager.getAllTags()) });
    }
  };

  const addFolder = async (name: string, parentId: string = 'root') => {
    bookmarkManager.createFolder(name, parentId);
    await loadData(); // Reload data from BookmarkManager
  };

  const deleteFolder = async (id: string) => {
    const success = bookmarkManager.deleteFolder(id);
    if (success) {
      dispatch({ type: 'DELETE_FOLDER', payload: id });
    }
  };

  const updateFolder = async (id: string, name: string) => {
    const success = bookmarkManager.updateFolder(id, name);
    if (success) {
      const updatedFolder = bookmarkManager.getFolders().find(f => f.id === id);
      if (updatedFolder) {
        dispatch({ type: 'UPDATE_FOLDER', payload: updatedFolder });
      }
    }
  };

  const setCurrentFolder = (folderId: string) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId });
  };

  const setView = (view: 'folder' | 'tag') => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const setViewMode = (mode: 'compact' | 'detailed') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const setSelectedTags = (tags: Set<string>) => {
    dispatch({ type: 'SET_SELECTED_TAGS', payload: tags });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const addTagToBookmark = async (bookmarkId: string, tag: string) => {
    bookmarkManager.addTagToBookmark(bookmarkId, tag);
    dispatch({ type: 'ADD_TAG', payload: tag });
    
    // Update the bookmark in state
    const bookmark = state.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark && !bookmark.tags.includes(tag)) {
      const updatedBookmark = { ...bookmark, tags: [...bookmark.tags, tag] };
      dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
    }
  };

  const removeTagFromBookmark = async (bookmarkId: string, tag: string) => {
    bookmarkManager.removeTagFromBookmark(bookmarkId, tag);
    
    // Update the bookmark in state
    const bookmark = state.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark && bookmark.tags.includes(tag)) {
      const updatedBookmark = { ...bookmark, tags: bookmark.tags.filter(t => t !== tag) };
      dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
    }
    
    // Update tags after cleanup (cleanupOrphanedTags is called automatically in BookmarkManager)
    dispatch({ type: 'CLEANUP_ORPHANED_TAGS', payload: new Set(bookmarkManager.getAllTags()) });
  };

  const refreshFavicon = async (bookmarkId: string): Promise<boolean> => {
    const success = await bookmarkManager.refreshFavicon(bookmarkId);
    if (success) {
      const updatedBookmark = state.bookmarks.find(b => b.id === bookmarkId);
      if (updatedBookmark) {
        dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
      }
    }
    return success;
  };

  const refreshOpenGraph = async (bookmarkId: string): Promise<boolean> => {
    const success = await bookmarkManager.refreshOpenGraph(bookmarkId);
    if (success) {
      const updatedBookmark = bookmarkManager.getBookmarks().find(b => b.id === bookmarkId);
      if (updatedBookmark) {
        dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
      }
    }
    return success;
  };

  const updateBookmarkOnVisit = async (bookmarkId: string) => {
    const updatedBookmark = await bookmarkManager.updateBookmarkOnVisit(bookmarkId);
    if (updatedBookmark) {
      dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
    }
  };

  const reorderBookmarks = async (fromIndex: number, toIndex: number) => {
    const success = await bookmarkManager.reorderBookmarks(state.currentFolderId, fromIndex, toIndex);
    if (success) {
      await loadData(); // Reload data to reflect new order
    }
  };

  const exportBookmarks = () => {
    bookmarkManager.exportToJSON();
  };

  const importBookmarks = async (jsonData: string, options = { merge: false, validateVersion: true }) => {
    const result = await bookmarkManager.importFromJSON(jsonData, options);
    if (result.success) {
      await loadData(); // Reload all data
    }
    return result;
  };

  const globalSearch = (query: string): SearchResult[] => {
    return bookmarkManager.globalSearch(query);
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const value: BookmarkContextType = {
    state,
    dispatch,
    bookmarkManager,
    loadData,
    addBookmark,
    deleteBookmark,
    addFolder,
    deleteFolder,
    updateFolder,
    setCurrentFolder,
    setView,
    setViewMode,
    setSelectedTags,
    setSearchQuery,
    addTagToBookmark,
    removeTagFromBookmark,
    refreshFavicon,
    refreshOpenGraph,
    updateBookmarkOnVisit,
    reorderBookmarks,
    exportBookmarks,
    importBookmarks,
    globalSearch,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Custom hook
export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
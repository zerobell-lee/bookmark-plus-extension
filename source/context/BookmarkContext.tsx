import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BookmarkState, Bookmark, Folder } from '../types/Bookmark';
import { BookmarkManager } from '../services/BookmarkManager';

// Initial state
const initialState: BookmarkState = {
  bookmarks: [],
  folders: [],
  tags: new Set(),
  currentFolderId: 'root',
  currentView: 'folder',
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
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_VIEW'; payload: 'folder' | 'tag' }
  | { type: 'SET_SELECTED_TAGS'; payload: Set<string> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string };

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
  setCurrentFolder: (folderId: string) => void;
  setView: (view: 'folder' | 'tag') => void;
  setSelectedTags: (tags: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  addTagToBookmark: (bookmarkId: string, tag: string) => Promise<void>;
  refreshFavicon: (bookmarkId: string) => Promise<boolean>;
  updateBookmarkOnVisit: (bookmarkId: string) => Promise<void>;
  reorderBookmarks: (fromIndex: number, toIndex: number) => Promise<void>;
  exportBookmarks: () => void;
  importBookmarks: (jsonData: string, options?: { merge: boolean; validateVersion: boolean }) => Promise<any>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// Provider component
interface BookmarkProviderProps {
  children: ReactNode;
}

// 전역 BookmarkManager 인스턴스 (싱글톤 패턴)
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
      // BookmarkManager가 이미 저장했으므로, Context를 다시 로드
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const deleteBookmark = async (id: string) => {
    const success = bookmarkManager.deleteBookmark(id);
    if (success) {
      dispatch({ type: 'DELETE_BOOKMARK', payload: id });
    }
  };

  const addFolder = async (name: string, parentId: string = 'root') => {
    bookmarkManager.createFolder(name, parentId);
    await loadData(); // BookmarkManager에서 데이터를 다시 로드
  };

  const deleteFolder = async (id: string) => {
    const success = bookmarkManager.deleteFolder(id);
    if (success) {
      dispatch({ type: 'DELETE_FOLDER', payload: id });
    }
  };

  const setCurrentFolder = (folderId: string) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId });
  };

  const setView = (view: 'folder' | 'tag') => {
    dispatch({ type: 'SET_VIEW', payload: view });
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

  const updateBookmarkOnVisit = async (bookmarkId: string) => {
    const updatedBookmark = await bookmarkManager.updateBookmarkOnVisit(bookmarkId);
    if (updatedBookmark) {
      dispatch({ type: 'UPDATE_BOOKMARK', payload: updatedBookmark });
    }
  };

  const reorderBookmarks = async (fromIndex: number, toIndex: number) => {
    const success = await bookmarkManager.reorderBookmarks(state.currentFolderId, fromIndex, toIndex);
    if (success) {
      await loadData(); // 데이터 다시 로드하여 순서 반영
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
    setCurrentFolder,
    setView,
    setSelectedTags,
    setSearchQuery,
    addTagToBookmark,
    refreshFavicon,
    updateBookmarkOnVisit,
    reorderBookmarks,
    exportBookmarks,
    importBookmarks,
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
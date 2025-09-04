export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId: string;
  tags: string[];
  favicon?: string;
  dateAdded: string;
  dateUpdated: string;
  visitCount: number;
  type: 'bookmark';
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  type: 'folder';
}

export type BookmarkItem = Bookmark | Folder;

export interface BookmarkState {
  bookmarks: Bookmark[];
  folders: Folder[];
  tags: Set<string>;
  currentFolderId: string;
  currentView: 'folder' | 'tag';
  selectedTags: Set<string>;
  searchQuery: string;
}

export interface ImportOptions {
  merge: boolean;
  validateVersion: boolean;
}

export interface ImportResult {
  success: boolean;
  imported?: {
    bookmarks: number;
    folders: number;
    tags: number;
  };
  version?: string;
  error?: string;
}

export interface ExportData {
  bookmarks: Bookmark[];
  folders: Folder[];
  tags: string[];
  exportDate: string;
  version: string;
  appVersion: string;
}

export interface ContextMenuTarget {
  target: Bookmark | Folder;
  type: 'bookmark' | 'folder';
}
export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string; // video, article, website, etc.
  url?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId: string;
  tags: string[];
  favicon?: string;
  openGraph?: OpenGraphData;
  hasRichPreview?: boolean; // UI display flag
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
  viewMode: 'compact' | 'detailed';
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

export interface SearchResult {
  bookmark: Bookmark;
  folderPath: string; // e.g., "Work/Projects" or "/" for root
  matchType: 'title' | 'url' | 'tag' | 'description';
  matchText: string; // The actual matched text
}

export interface ContextMenuTarget {
  target: Bookmark | Folder;
  type: 'bookmark' | 'folder';
}
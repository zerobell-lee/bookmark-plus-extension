import { Bookmark, Folder, ImportOptions, ImportResult, ExportData, SearchResult, OpenGraphData } from '../types/Bookmark';
import { browser } from 'webextension-polyfill-ts';

export class BookmarkManager {
  private bookmarks: Bookmark[] = [];
  private folders: Folder[] = [];
  private tags: Set<string> = new Set();

  async init(): Promise<void> {
    await this.loadBookmarks();
    await this.loadTags();
  }

  async loadBookmarks(): Promise<void> {
    try {
      const result = await browser.storage.sync.get(['bookmarks', 'folders']);
      this.bookmarks = result.bookmarks || [];
      this.folders = result.folders || this.createDefaultFolders();
      
      // Collect tags from bookmarks and add to this.tags
      this.bookmarks.forEach(bookmark => {
        if (bookmark.tags && bookmark.tags.length > 0) {
          bookmark.tags.forEach(tag => this.tags.add(tag));
        }
      });
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }

  async loadTags(): Promise<void> {
    try {
      const result = await browser.storage.sync.get(['tags']);
      const storedTags = result.tags || [];
      
      // Add stored tags to existing tags (without overwriting)
      storedTags.forEach((tag: string) => this.tags.add(tag));
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  private createDefaultFolders(): Folder[] {
    return [
      {
        id: 'root',
        name: '/',
        parentId: null,
        children: [],
        type: 'folder'
      }
    ];
  }

  async createBookmark(title: string, url: string, folderId: string = 'root', tags: string[] = []): Promise<Bookmark> {
    const [favicon, openGraph] = await Promise.all([
      this.extractFavicon(url),
      this.extractOpenGraph(url)
    ]);
    
    return this.createBookmarkWithMetadata(title, url, folderId, tags, favicon, openGraph);
  }

  // Legacy method for backward compatibility
  async createBookmarkWithFavicon(
    title: string, 
    url: string, 
    folderId: string = 'root', 
    tags: string[] = [], 
    favicon: string | null = null
  ): Promise<Bookmark> {
    return this.createBookmarkWithMetadata(title, url, folderId, tags, favicon, null);
  }

  async createBookmarkWithMetadata(
    title: string, 
    url: string, 
    folderId: string = 'root', 
    tags: string[] = [], 
    favicon: string | null = null,
    openGraph: OpenGraphData | null = null
  ): Promise<Bookmark> {
    // Check for duplicate URL
    const existingBookmark = this.bookmarks.find(b => b.url === url);
    if (existingBookmark) {
      throw new Error(`Bookmark already exists for this URL: "${existingBookmark.title}"`);
    }

    if (!favicon) {
      favicon = await this.extractFavicon(url);
    }
    
    const bookmark: Bookmark = {
      id: this.generateId(),
      title,
      url,
      folderId,
      tags,
      favicon: favicon || '',
      openGraph: openGraph || undefined,
      hasRichPreview: Boolean(openGraph && (openGraph.image || openGraph.description)),
      dateAdded: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      visitCount: 0,
      type: 'bookmark'
    };

    this.bookmarks.push(bookmark);
    tags.forEach(tag => this.tags.add(tag));
    await this.saveBookmarks();
    await this.saveTags();
    
    return bookmark;
  }

  createFolder(name: string, parentId: string = 'root'): Folder {
    const folder: Folder = {
      id: this.generateId(),
      name,
      parentId,
      children: [],
      type: 'folder'
    };

    this.folders.push(folder);
    
    if (parentId) {
      const parentFolder = this.folders.find(f => f.id === parentId);
      if (parentFolder) {
        parentFolder.children.push(folder.id);
      }
    }
    
    this.saveFolders();
    return folder;
  }

  addTagToBookmark(bookmarkId: string, tag: string): void {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark && !bookmark.tags.includes(tag)) {
      bookmark.tags.push(tag);
      this.tags.add(tag);
      this.saveBookmarks();
      this.saveTags();
    }
  }

  removeTagFromBookmark(bookmarkId: string, tag: string): void {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      bookmark.tags = bookmark.tags.filter(t => t !== tag);
      this.saveBookmarks();
      
      // Check if tag is now orphaned and clean up
      this.cleanupOrphanedTags();
    }
  }

  searchByTags(tags: string[]): Bookmark[] {
    if (!tags || tags.length === 0) return this.bookmarks;
    
    return this.bookmarks.filter(bookmark => 
      tags.some(tag => bookmark.tags.includes(tag))
    );
  }

  searchByTitle(query: string): Bookmark[] {
    if (!query) return this.bookmarks;
    
    const lowercaseQuery = query.toLowerCase();
    return this.bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowercaseQuery)
    );
  }

  getBookmarksByFolder(folderId: string): Bookmark[] {
    return this.bookmarks.filter(bookmark => bookmark.folderId === folderId);
  }

  getFolderHierarchy(folderId: string = 'root'): any {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return null;

    const bookmarks = this.getBookmarksByFolder(folderId);
    const childFolders = this.folders
      .filter(f => f.parentId === folderId)
      .map(f => this.getFolderHierarchy(f.id));

    return {
      ...folder,
      bookmarks,
      childFolders
    };
  }

  exportToJSON(): void {
    const exportData: ExportData = {
      bookmarks: this.bookmarks,
      folders: this.folders,
      tags: Array.from(this.tags),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      appVersion: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark+-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  async importFromJSON(jsonData: string, options: ImportOptions = { merge: false, validateVersion: true }): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonData);
      
      // Version validation
      if (options.validateVersion && data.version) {
        const importVersion = this.parseVersion(data.version);
        const currentVersion = this.parseVersion('1.0.0');
        
        if (importVersion.major > currentVersion.major) {
          throw new Error(`Import data version (${data.version}) is newer than current app version (1.0.0). Please update the extension.`);
        }
      }

      // Data validation
      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data format');
      }

      if (options.merge) {
        await this.mergeImportedData(data);
      } else {
        await this.replaceAllData(data);
      }

      return {
        success: true,
        imported: {
          bookmarks: data.bookmarks?.length || 0,
          folders: data.folders?.length || 0,
          tags: data.tags?.length || 0
        },
        version: data.version || 'unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  private validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    if (data.bookmarks && !Array.isArray(data.bookmarks)) return false;
    if (data.bookmarks) {
      for (const bookmark of data.bookmarks) {
        if (!bookmark.id || !bookmark.title || !bookmark.url) return false;
      }
    }

    if (data.folders && !Array.isArray(data.folders)) return false;
    if (data.folders) {
      for (const folder of data.folders) {
        if (!folder.id || !folder.name) return false;
      }
    }

    if (data.tags && !Array.isArray(data.tags)) return false;

    return true;
  }

  private async mergeImportedData(data: any): Promise<void> {
    const existingBookmarkIds = new Set(this.bookmarks.map(b => b.id));
    const existingFolderIds = new Set(this.folders.map(f => f.id));

    if (data.bookmarks) {
      for (const bookmark of data.bookmarks) {
        if (!existingBookmarkIds.has(bookmark.id)) {
          this.bookmarks.push(bookmark);
        }
      }
    }

    if (data.folders) {
      for (const folder of data.folders) {
        if (!existingFolderIds.has(folder.id)) {
          this.folders.push(folder);
        }
      }
    }

    if (data.tags) {
      data.tags.forEach((tag: string) => this.tags.add(tag));
    }

    await this.saveAllData();
  }

  private async replaceAllData(data: any): Promise<void> {
    if (data.bookmarks) this.bookmarks = data.bookmarks;
    if (data.folders) this.folders = data.folders;
    if (data.tags) this.tags = new Set(data.tags);

    if (!this.folders.find(f => f.id === 'root')) {
      this.folders.unshift({
        id: 'root',
        name: '/',
        parentId: null,
        children: [],
        type: 'folder'
      });
    }

    await this.saveAllData();
  }

  private async saveAllData(): Promise<void> {
    await Promise.all([
      this.saveBookmarks(),
      this.saveFolders(),
      this.saveTags()
    ]);
  }

  private async saveBookmarks(): Promise<void> {
    await browser.storage.sync.set({ bookmarks: this.bookmarks });
  }

  private async saveFolders(): Promise<void> {
    await browser.storage.sync.set({ folders: this.folders });
  }

  private async saveTags(): Promise<void> {
    await browser.storage.sync.set({ tags: Array.from(this.tags) });
  }

  private generateId(): string {
    return 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  deleteBookmark(bookmarkId: string): boolean {
    const bookmarkToDelete = this.bookmarks.find(b => b.id === bookmarkId);
    
    if (!bookmarkToDelete) {
      return false;
    }
    
    this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
    this.saveBookmarks();
    
    // Clean up orphaned tags after bookmark deletion
    this.cleanupOrphanedTags();
    
    return true;
  }

  deleteFolder(folderId: string): boolean {
    if (folderId === 'root') return false;
    
    this.bookmarks = this.bookmarks.filter(b => b.folderId !== folderId);
    
    const folder = this.folders.find(f => f.id === folderId);
    if (folder && folder.parentId) {
      const parentFolder = this.folders.find(f => f.id === folder.parentId);
      if (parentFolder) {
        parentFolder.children = parentFolder.children.filter(id => id !== folderId);
      }
    }
    
    this.folders = this.folders.filter(f => f.id !== folderId);
    
    this.saveBookmarks();
    this.saveFolders();
    return true;
  }

  moveBookmark(bookmarkId: string, newFolderId: string): void {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      bookmark.folderId = newFolderId;
      this.saveBookmarks();
    }
  }

  getAllTags(): string[] {
    return Array.from(this.tags);
  }

  getBookmarks(): Bookmark[] {
    return this.bookmarks;
  }

  getFolders(): Folder[] {
    return this.folders;
  }

  private async extractFavicon(url: string): Promise<string> {
    try {
      // 1. Try current tab's favIconUrl
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url === url && tabs[0].favIconUrl) {
          return tabs[0].favIconUrl;
        }
      } catch (error) {
        // Continue if tab access fails
      }

      // 2. Try default favicon paths (added more paths)
      const domain = new URL(url);
      const faviconUrls = [
        `${domain.origin}/favicon.ico`,
        `${domain.origin}/favicon.png`,
        `${domain.origin}/favicon.svg`,
        `${domain.origin}/apple-touch-icon.png`,
        `${domain.origin}/apple-touch-icon-precomposed.png`,
        `${domain.origin}/assets/favicon.ico`,
        `${domain.origin}/assets/favicon.png`,
        `${domain.origin}/static/favicon.ico`,
        `${domain.origin}/static/favicon.png`
      ];

      for (const faviconUrl of faviconUrls) {
        try {
          const isValid = await this.validateFaviconUrl(faviconUrl);
          if (isValid) {
            return faviconUrl;
          }
        } catch (error) {
          continue;
        }
      }

      // 3. Try external favicon services (multiple services for better reliability)
      const faviconServices = [
        `https://www.google.com/s2/favicons?domain=${domain.hostname}&sz=16`,
        `https://icons.duckduckgo.com/ip3/${domain.hostname}.ico`,
        `https://favicongrabber.com/api/grab/${domain.hostname}?pretty=true`,
        `https://icon.horse/icon/${domain.hostname}`
      ];

      for (const serviceUrl of faviconServices) {
        try {
          if (serviceUrl.includes('favicongrabber.com')) {
            // Favicongrabber API requires JSON response handling
            const response = await fetch(serviceUrl);
            const data = await response.json();
            if (data.icons && data.icons.length > 0) {
              const bestIcon = data.icons.find((icon: any) => icon.sizes && (icon.sizes.includes('16x16') || icon.sizes.includes('32x32'))) || data.icons[0];
              if (bestIcon && bestIcon.src) {
                const isValid = await this.validateFaviconUrl(bestIcon.src);
                if (isValid) return bestIcon.src;
              }
            }
          } else {
            const isValid = await this.validateFaviconUrl(serviceUrl);
            if (isValid) return serviceUrl;
          }
        } catch (error) {
          continue;
        }
      }

      // 4. Use default icon if all attempts fail
      return this.getDefaultFavicon(url);
    } catch (error) {
      return this.getDefaultFavicon(url);
    }
  }

  private validateFaviconUrl(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 3000);

      img.onload = () => {
        clearTimeout(timeoutId);
        if (img.width > 0 && img.height > 0) {
          resolve(true);
        } else {
          reject(new Error('Invalid image size'));
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  private getDefaultFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      const firstChar = domain.charAt(0).toUpperCase();
      return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23${this.stringToColor(domain)}" rx="4"/><text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${firstChar}</text></svg>`;
    } catch (error) {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%236b7280" rx="4"/><path d="M10 14a4 4 0 0 1 8 0v1a4 4 0 0 1-8 0v-1zm4-6a6 6 0 0 0-6 6v1a6 6 0 0 0 12 0v-1a6 6 0 0 0-6-6z" fill="white"/></svg>';
    }
  }

  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).padStart(6, '0');
    return color;
  }


  // Extract OpenGraph metadata from URL
  private async extractOpenGraph(url: string): Promise<OpenGraphData | null> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bookmark+ Extension)',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const openGraphData: OpenGraphData = {};

      // Parse OpenGraph meta tags
      const ogTagRegex = /<meta\s+property\s*=\s*["']og:([^"']+)["']\s+content\s*=\s*["']([^"']*)["'][^>]*>/gi;
      let match;

      while ((match = ogTagRegex.exec(html)) !== null) {
        const property = match[1];
        const content = match[2];

        switch (property) {
          case 'title':
            openGraphData.title = content;
            break;
          case 'description':
            openGraphData.description = content;
            break;
          case 'image':
            if (this.isValidImageUrl(content)) {
              openGraphData.image = content;
            }
            break;
          case 'site_name':
            openGraphData.siteName = content;
            break;
          case 'type':
            openGraphData.type = content;
            break;
          case 'url':
            openGraphData.url = content;
            break;
        }
      }

      // Validate minimum requirements
      if (!openGraphData.title && !openGraphData.image) {
        return null;
      }

      return openGraphData;
    } catch (error) {
      console.log('OpenGraph extraction failed for:', url, error);
      return null;
    }
  }

  // Validate image URL for OpenGraph
  private isValidImageUrl(imageUrl: string): boolean {
    try {
      const url = new URL(imageUrl);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const extension = url.pathname.toLowerCase();
      
      return validExtensions.some(ext => extension.includes(ext)) ||
             url.hostname.includes('images') || // Common image hosting patterns
             url.pathname.includes('/image/') ||
             url.pathname.includes('/thumb/');
    } catch (error) {
      return false;
    }
  }

  // Clean up tags that are no longer used by any bookmarks
  cleanupOrphanedTags(): void {
    const usedTags = new Set<string>();
    
    // Collect all tags currently in use
    this.bookmarks.forEach(bookmark => {
      if (bookmark.tags && bookmark.tags.length > 0) {
        bookmark.tags.forEach(tag => usedTags.add(tag));
      }
    });
    
    // Update global tags to only include used tags
    this.tags = usedTags;
    this.saveTags();
  }

  // Update folder name
  updateFolder(folderId: string, newName: string): boolean {
    if (folderId === 'root') return false; // Cannot rename root folder
    
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return false;
    
    folder.name = newName;
    this.saveFolders();
    return true;
  }

  // Get folder path for display (e.g., "Work/Projects")
  getFolderPath(folderId: string): string {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown';
    
    if (folder.parentId === null || folder.parentId === 'root') {
      return folder.name === '/' ? '/' : folder.name;
    }
    
    const parentPath = this.getFolderPath(folder.parentId);
    if (parentPath === '/') {
      return folder.name;
    }
    
    return `${parentPath}/${folder.name}`;
  }

  // Global search across all bookmarks with location information
  globalSearch(query: string): SearchResult[] {
    if (!query || query.trim() === '') return [];
    
    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];
    
    for (const bookmark of this.bookmarks) {
      let bestMatch: {matchType: 'title' | 'url' | 'tag' | 'description', matchText: string} | null = null;
      const matchPriority = { title: 0, tag: 1, description: 2, url: 3 };
      
      // Search in title (highest priority)
      if (bookmark.title.toLowerCase().includes(searchTerm)) {
        bestMatch = {
          matchType: 'title',
          matchText: bookmark.title
        };
      }
      
      // Search in tags (second priority)
      if (!bestMatch || matchPriority.tag < matchPriority[bestMatch.matchType]) {
        const matchingTag = bookmark.tags.find(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        if (matchingTag) {
          bestMatch = {
            matchType: 'tag',
            matchText: matchingTag
          };
        }
      }
      
      // Search in OpenGraph description (third priority)
      if (!bestMatch || matchPriority.description < matchPriority[bestMatch.matchType]) {
        if (bookmark.openGraph?.description?.toLowerCase().includes(searchTerm)) {
          bestMatch = {
            matchType: 'description',
            matchText: bookmark.openGraph.description
          };
        }
      }
      
      // Search in URL (lowest priority)
      if (!bestMatch || matchPriority.url < matchPriority[bestMatch.matchType]) {
        if (bookmark.url.toLowerCase().includes(searchTerm)) {
          bestMatch = {
            matchType: 'url',
            matchText: bookmark.url
          };
        }
      }
      
      // Add only one result per bookmark (the best match)
      if (bestMatch) {
        results.push({
          bookmark,
          folderPath: this.getFolderPath(bookmark.folderId),
          matchType: bestMatch.matchType,
          matchText: bestMatch.matchText
        });
      }
    }
    
    // Sort by relevance (title matches first, then others)
    return results.sort((a, b) => {
      const typeOrder = { title: 0, tag: 1, description: 2, url: 3 };
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    });
  }

  async updateBookmarkOnVisit(bookmarkId: string): Promise<Bookmark | null> {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return null;

    bookmark.visitCount = (bookmark.visitCount || 0) + 1;
    bookmark.dateUpdated = new Date().toISOString();

    const lastUpdate = new Date(bookmark.dateUpdated || bookmark.dateAdded);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 7) {
      try {
        const newFavicon = await this.extractFavicon(bookmark.url);
        bookmark.favicon = newFavicon;
      } catch (error) {
        // Ignore favicon refresh failures
      }
    }

    await this.saveBookmarks();
    return bookmark;
  }

  async refreshFavicon(bookmarkId: string): Promise<boolean> {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return false;

    try {
      const newFavicon = await this.extractFavicon(bookmark.url);
      bookmark.favicon = newFavicon;
      bookmark.dateUpdated = new Date().toISOString();
      
      await this.saveBookmarks();
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshOpenGraph(bookmarkId: string): Promise<boolean> {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return false;

    try {
      const newOpenGraph = await this.extractOpenGraph(bookmark.url);
      bookmark.openGraph = newOpenGraph || undefined;
      bookmark.hasRichPreview = Boolean(newOpenGraph && (newOpenGraph.image || newOpenGraph.description));
      bookmark.dateUpdated = new Date().toISOString();
      
      await this.saveBookmarks();
      return true;
    } catch (error) {
      return false;
    }
  }

  async reorderBookmarks(folderId: string, fromIndex: number, toIndex: number): Promise<boolean> {
    try {
      const folderBookmarks = this.bookmarks.filter(b => b.folderId === folderId);
      
      if (fromIndex < 0 || toIndex < 0 || 
          fromIndex >= folderBookmarks.length || 
          toIndex >= folderBookmarks.length || 
          fromIndex === toIndex) {
        return false;
      }

      const [movedBookmark] = folderBookmarks.splice(fromIndex, 1);
      folderBookmarks.splice(toIndex, 0, movedBookmark);

      // Combine bookmarks from other folders with reordered bookmarks and save
      const otherBookmarks = this.bookmarks.filter(b => b.folderId !== folderId);
      this.bookmarks = [...otherBookmarks, ...folderBookmarks];

      await this.saveBookmarks();
      return true;
    } catch (error) {
      console.error('Error reordering bookmarks:', error);
      return false;
    }
  }
}
import { browser } from 'webextension-polyfill-ts';

browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  console.log('📚', 'bookmark+ extension installed');
  
  // Initialize default folder structure
  try {
    const result = await browser.storage.sync.get(['folders']);
    
    if (!result.folders || result.folders.length === 0) {
      const defaultFolders = [{
        id: 'root',
        name: '/',
        parentId: null,
        children: [],
        type: 'folder'
      }];
      
      await browser.storage.sync.set({ 
        folders: defaultFolders,
        bookmarks: [],
        tags: []
      });
      
      console.log('📚', 'Default folder structure initialized');
    }
  } catch (error) {
    console.error('Failed to initialize default structure:', error);
  }
});

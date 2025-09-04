import { browser } from 'webextension-polyfill-ts';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeSettings {
  theme: Theme;
  systemTheme?: 'light' | 'dark';
}

export class ThemeManager {
  private static instance: ThemeManager | null = null;
  private currentTheme: Theme = 'auto';
  private systemPrefersDark = false;
  private mediaQuery: MediaQueryList;
  private listeners: Set<(theme: Theme, resolvedTheme: 'light' | 'dark') => void> = new Set();

  private constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark = this.mediaQuery.matches;
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    
    // Initialize theme
    this.initializeTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private async initializeTheme(): Promise<void> {
    try {
      const result = await browser.storage.sync.get(['themeSettings']);
      const savedSettings: ThemeSettings = result.themeSettings || { theme: 'auto' };
      
      this.currentTheme = savedSettings.theme;
      this.applyTheme();
    } catch (error) {
      console.error('Error loading theme settings:', error);
      this.currentTheme = 'auto';
      this.applyTheme();
    }
  }

  private handleSystemThemeChange = (e: MediaQueryListEvent) => {
    this.systemPrefersDark = e.matches;
    
    // Only apply if current theme is auto
    if (this.currentTheme === 'auto') {
      this.applyTheme();
    }
    
    this.notifyListeners();
  };

  public async setTheme(theme: Theme): Promise<void> {
    this.currentTheme = theme;
    
    try {
      const settings: ThemeSettings = {
        theme: theme,
        systemTheme: this.systemPrefersDark ? 'dark' : 'light'
      };
      
      await browser.storage.sync.set({ themeSettings: settings });
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
    
    this.applyTheme();
    this.notifyListeners();
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return this.systemPrefersDark ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  public getSystemTheme(): 'light' | 'dark' {
    return this.systemPrefersDark ? 'dark' : 'light';
  }

  private applyTheme(): void {
    const resolvedTheme = this.getResolvedTheme();
    
    // Add theme switching class to prevent transition flicker
    document.documentElement.classList.add('theme-switching');
    
    // Remove existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Apply new theme
    if (this.currentTheme !== 'auto') {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    // Remove theme switching class after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 10);
    
    // Update meta theme-color for browser UI
    this.updateMetaThemeColor(resolvedTheme);
  }

  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }

  public toggleTheme(): Promise<void> {
    let newTheme: Theme;
    
    switch (this.currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'light';
        break;
      case 'auto':
        // Toggle to opposite of current system theme
        newTheme = this.systemPrefersDark ? 'light' : 'dark';
        break;
      default:
        newTheme = 'auto';
    }
    
    return this.setTheme(newTheme);
  }

  public addThemeChangeListener(
    callback: (theme: Theme, resolvedTheme: 'light' | 'dark') => void
  ): void {
    this.listeners.add(callback);
  }

  public removeThemeChangeListener(
    callback: (theme: Theme, resolvedTheme: 'light' | 'dark') => void
  ): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const resolvedTheme = this.getResolvedTheme();
    this.listeners.forEach(callback => {
      try {
        callback(this.currentTheme, resolvedTheme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  public getThemeIcon(): string {
    const resolvedTheme = this.getResolvedTheme();
    
    switch (this.currentTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return resolvedTheme === 'dark' ? '🌙' : '☀️';
      default:
        return '🌙';
    }
  }

  public getThemeLabel(): string {
    switch (this.currentTheme) {
      case 'light':
        return 'Light Theme';
      case 'dark':
        return 'Dark Theme';
      case 'auto':
        return `Auto (${this.getResolvedTheme()})`;
      default:
        return 'Auto Theme';
    }
  }

  public dispose(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    this.listeners.clear();
  }
}
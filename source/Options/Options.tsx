import React, { useState, useEffect } from 'react';
import { ThemeManager, Theme } from '../services/ThemeManager';
import { ThemeToggle } from '../components/ThemeToggle';
import '../components/ThemeToggle.scss';
import './styles.scss';

const Options: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('auto');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  
  const themeManager = ThemeManager.getInstance();

  useEffect(() => {
    setCurrentTheme(themeManager.getTheme());
    setSystemTheme(themeManager.getSystemTheme());

    const handleThemeChange = (theme: Theme) => {
      setCurrentTheme(theme);
      setSystemTheme(themeManager.getSystemTheme());
    };

    themeManager.addThemeChangeListener(handleThemeChange);
    return () => themeManager.removeThemeChangeListener(handleThemeChange);
  }, [themeManager]);

  const handleThemeSelect = async (theme: Theme) => {
    setIsLoading(true);
    try {
      await themeManager.setTheme(theme);
    } catch (error) {
      console.error('Error setting theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Bookmark+ Settings</h1>
        <p>Customize your bookmark management experience</p>
      </header>

      <main className="options-content">
        <section className="options-section">
          <h2>Appearance</h2>
          <div className="theme-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Theme</h3>
                <p>Choose your preferred color scheme</p>
              </div>
              <div className="setting-control">
                <ThemeToggle showLabel={true} size="large" />
              </div>
            </div>

            <div className="theme-options">
              <div className="theme-option">
                <input
                  type="radio"
                  id="theme-auto"
                  name="theme"
                  value="auto"
                  checked={currentTheme === 'auto'}
                  onChange={() => handleThemeSelect('auto')}
                  disabled={isLoading}
                />
                <label htmlFor="theme-auto" className="theme-option-label">
                  <div className="theme-preview auto-theme">
                    <div className="preview-light"></div>
                    <div className="preview-dark"></div>
                  </div>
                  <div className="theme-info">
                    <span className="theme-name">Auto</span>
                    <span className="theme-desc">Follow system setting (currently {systemTheme})</span>
                  </div>
                </label>
              </div>

              <div className="theme-option">
                <input
                  type="radio"
                  id="theme-light"
                  name="theme"
                  value="light"
                  checked={currentTheme === 'light'}
                  onChange={() => handleThemeSelect('light')}
                  disabled={isLoading}
                />
                <label htmlFor="theme-light" className="theme-option-label">
                  <div className="theme-preview light-theme">
                    <div className="preview-content">☀️</div>
                  </div>
                  <div className="theme-info">
                    <span className="theme-name">Light</span>
                    <span className="theme-desc">Bright and clean</span>
                  </div>
                </label>
              </div>

              <div className="theme-option">
                <input
                  type="radio"
                  id="theme-dark"
                  name="theme"
                  value="dark"
                  checked={currentTheme === 'dark'}
                  onChange={() => handleThemeSelect('dark')}
                  disabled={isLoading}
                />
                <label htmlFor="theme-dark" className="theme-option-label">
                  <div className="theme-preview dark-theme">
                    <div className="preview-content">🌙</div>
                  </div>
                  <div className="theme-info">
                    <span className="theme-name">Dark</span>
                    <span className="theme-desc">Easy on the eyes</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="options-section">
          <h2>About</h2>
          <div className="about-info">
            <div className="app-info">
              <img src="assets/icons/favicon-48.png" alt="Bookmark+" className="app-icon" />
              <div>
                <h3>Bookmark+ v1.0.0</h3>
                <p>Enhanced bookmark management with tags and advanced search</p>
              </div>
            </div>
            
            <div className="credits">
              <p>Built with <a href="https://github.com/abhijithvijayan/web-extension-starter" target="_blank" rel="noopener noreferrer">web-extension-starter</a> by Abhijith Vijayan</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Options;

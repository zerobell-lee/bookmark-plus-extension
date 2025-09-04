import React, { useState, useEffect } from 'react';
import { ThemeManager, Theme } from '../services/ThemeManager';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  size = 'medium'
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  
  const themeManager = ThemeManager.getInstance();

  useEffect(() => {
    // Initialize theme state
    setCurrentTheme(themeManager.getTheme());
    setResolvedTheme(themeManager.getResolvedTheme());
    setIsLoading(false);

    // Listen for theme changes
    const handleThemeChange = (theme: Theme, resolved: 'light' | 'dark') => {
      setCurrentTheme(theme);
      setResolvedTheme(resolved);
    };

    themeManager.addThemeChangeListener(handleThemeChange);

    return () => {
      themeManager.removeThemeChangeListener(handleThemeChange);
    };
  }, [themeManager]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await themeManager.toggleTheme();
    } catch (error) {
      console.error('Error toggling theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'theme-toggle-small';
      case 'large':
        return 'theme-toggle-large';
      default:
        return 'theme-toggle-medium';
    }
  };

  const getIcon = () => {
    if (isLoading) return '⏳';
    return themeManager.getThemeIcon();
  };

  const getLabel = () => {
    if (isLoading) return 'Loading...';
    return themeManager.getThemeLabel();
  };

  const getTooltip = () => {
    switch (currentTheme) {
      case 'light':
        return 'Switch to dark theme';
      case 'dark':
        return 'Switch to light theme';  
      case 'auto':
        return `Switch from auto (currently ${resolvedTheme})`;
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      className={`theme-toggle ${getButtonSize()} ${className}`}
      onClick={handleToggle}
      disabled={isLoading}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <span className="theme-icon">{getIcon()}</span>
      {showLabel && (
        <span className="theme-label">{getLabel()}</span>
      )}
    </button>
  );
};
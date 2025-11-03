import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState(() => {
    // Get saved theme config or default
    const savedConfig = localStorage.getItem('themeConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }

    // Check system preference for theme mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      theme: systemPrefersDark ? 'dark' : 'light',
      primaryColor: '#3B82F6',
      backgroundStyle: 'gradient',
      fontSize: 'medium'
    };
  });

  const { theme, primaryColor, backgroundStyle, fontSize } = themeConfig;

  const updateThemeConfig = (newConfig) => {
    setThemeConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    updateThemeConfig({ theme: newTheme });
  };

  const setTheme = (newTheme) => {
    updateThemeConfig({ theme: newTheme });
  };

  const applyThemeCustomization = (config) => {
    updateThemeConfig(config);
  };

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(effectiveTheme);

    // Apply primary color
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-color-hover', primaryColor + 'dd');
    root.style.setProperty('--primary-color-light', primaryColor + '20');

    // Apply background style
    if (effectiveTheme === 'dark') {
      switch (backgroundStyle) {
        case 'solid':
          root.style.setProperty('--bg-gradient', 'rgb(15 23 42)');
          break;
        case 'gradient':
          root.style.setProperty('--bg-gradient', 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))');
          break;
        case 'subtle':
          root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 20% 50%, rgb(30 41 59) 0%, rgb(15 23 42) 100%)');
          break;
        default:
          root.style.setProperty('--bg-gradient', 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))');
      }
    } else {
      switch (backgroundStyle) {
        case 'solid':
          root.style.setProperty('--bg-gradient', 'rgb(249 250 251)');
          break;
        case 'gradient':
          root.style.setProperty('--bg-gradient', 'linear-gradient(to bottom right, rgb(249 250 251), rgb(243 244 246), rgb(249 250 251))');
          break;
        case 'subtle':
          root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 80% 50%, rgb(243 244 246) 0%, rgb(249 250 251) 100%)');
          break;
        default:
          root.style.setProperty('--bg-gradient', 'linear-gradient(to bottom right, rgb(249 250 251), rgb(243 244 246), rgb(249 250 251))');
      }
    }

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[fontSize]);

    // Save to localStorage
    localStorage.setItem('themeConfig', JSON.stringify(themeConfig));
  }, [themeConfig]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value = {
    theme,
    primaryColor,
    backgroundStyle,
    fontSize,
    themeConfig,
    toggleTheme,
    setTheme,
    applyThemeCustomization,
    updateThemeConfig,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
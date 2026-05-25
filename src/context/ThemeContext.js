import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTheme, saveTheme } from '../services/storageService';
import { COLORS } from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await getTheme();
      setIsDark(storedTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await saveTheme(newTheme);
  };

  const theme = useMemo(() => ({
    bg: isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC'),
    surface: isDark ? (COLORS.darkSurface || '#2C2C2C') : (COLORS.surface || '#FFFFFF'),
    surfaceAlt: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
    card: isDark ? (COLORS.darkCard || '#383838') : (COLORS.surface || '#FFFFFF'),
    border: isDark ? (COLORS.darkBorder || '#4A4A4A') : (COLORS.border || '#E8D5C0'),
    textPrimary: isDark ? (COLORS.darkTextPrimary || '#F0EAD6') : (COLORS.textPrimary || '#3A2F24'),
    textSecondary: isDark ? (COLORS.darkTextSecondary || '#C2B2A3') : (COLORS.textSecondary || '#6B5744'),
    accentGold: isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37'),
    accentBlueGreen: isDark ? (COLORS.darkAccentBlueGreen || '#00BFB2') : (COLORS.accentBlueGreen || '#006A60'),
    primary: COLORS.primary || '#E65100',
    saffron: isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100'),
    shadow: isDark ? 'rgba(0,0,0,0.5)' : (COLORS.shadow || 'rgba(0, 0, 0, 0.15)'),
  }), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

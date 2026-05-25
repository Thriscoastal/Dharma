import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFontSize, saveFontSize, DEFAULT_FONT_SIZE, getScaledSizes } from '../services/fontSizeService';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [scaledSizes, setScaledSizes] = useState(getScaledSizes(DEFAULT_FONT_SIZE));

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    const size = await getFontSize();
    if (size !== fontSize) {
      setFontSize(size);
      setScaledSizes(getScaledSizes(size));
    }
  };

  const updateFontSize = async (newSize) => {
    if (newSize === fontSize) return;
    
    setFontSize(newSize);
    setScaledSizes(getScaledSizes(newSize));
    await saveFontSize(newSize);
  };

  const value = React.useMemo(() => ({
    fontSize,
    scaledSizes,
    updateFontSize
  }), [fontSize, scaledSizes]);

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
};

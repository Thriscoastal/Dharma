import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all translation files
import en from '../i18n/en.json';
import te from '../i18n/te.json';
import hi from '../i18n/hi.json';
import ta from '../i18n/ta.json';
import ml from '../i18n/ml.json';
import kn from '../i18n/kn.json';

const translationFiles = {
  en,
  te,
  hi,
  ta,
  ml,
  kn,
};

const LANGUAGE_KEY = '@dharma_language';
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && translationFiles[savedLanguage] && savedLanguage !== language) {
        setLanguage(savedLanguage);
        setTranslations(translationFiles[savedLanguage]);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (newLanguage) => {
    if (newLanguage === language) return;
    
    try {
      if (translationFiles[newLanguage]) {
        setLanguage(newLanguage);
        setTranslations(translationFiles[newLanguage]);
        await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const value = React.useMemo(() => ({
    language,
    translations,
    changeLanguage
  }), [language, translations]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

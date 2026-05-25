import React from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook to access translations
 * @returns {function} t - Translation function
 */
export const useTranslation = () => {
  const { translations } = useLanguage();

  const t = React.useCallback((key) => {
    if (!key) return '';
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        // Use console.debug instead of warn to avoid flooding in production-like environments
        return key;
      }
    }

    return value;
  }, [translations]);

  return t;
};

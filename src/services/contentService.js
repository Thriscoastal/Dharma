/**
 * Content Service
 * Handles language-based mapping for database content (Chapters, Slokas, Meanings)
 */

export const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  TELUGU: 'te',
  TAMIL: 'ta',
  MALAYALAM: 'ml',
  KANNADA: 'kn',
};

// Map app language codes to database language names
export const DB_LANGUAGE_NAMES = {
  [LANGUAGES.HINDI]: 'Hindi',
  [LANGUAGES.TELUGU]: 'Telugu',
  [LANGUAGES.TAMIL]: 'Tamil',
  [LANGUAGES.MALAYALAM]: 'Malayalam',
  [LANGUAGES.KANNADA]: 'Kannada',
};

/**
 * Get localized chapter name
 */
export const getChapterName = (chapter, language) => {
  if (!chapter) return '';
  
  switch (language) {
    case LANGUAGES.HINDI:
      return chapter.name_hindi || chapter.name_english;
    case LANGUAGES.TELUGU:
      return chapter.name_telugu || chapter.name_english;
    case LANGUAGES.TAMIL:
      return chapter.name_tamil || chapter.name_english;
    case LANGUAGES.MALAYALAM:
      return chapter.name_malayalam || chapter.name_english;
    case LANGUAGES.KANNADA:
      return chapter.name_kannada || chapter.name_english;
    case LANGUAGES.ENGLISH:
    default:
      return chapter.name_english;
  }
};

/**
 * Get localized sloka text and format it into two lines
 */
export const getSlokaText = (sloka, translation, language) => {
  if (!sloka) return '';
  
  // For English, always use Sanskrit
  let text = (language === LANGUAGES.ENGLISH) 
    ? sloka.sanskrit 
    : (translation?.shloka_text || sloka.sanskrit);

  if (!text) return '';

  // Clean the text and handle formatting
  // 1. Replace any existing double spaces or odd line breaks
  text = text.trim().replace(/\s+/g, ' ');

  // 2. Identify the midpoint (। marker usually splits the two lines of a sloka)
  // Some slokas might use multiple । or ॥. 
  // We want to split at the first । that is roughly in the middle, or the last ॥ if it's the end.
  
  if (text.includes('।') && !text.includes('\n')) {
    // Split at the first single pipe '।', but not the double pipe '॥'
    // We look for a '।' that is NOT followed by another '।'
    const parts = text.split(/।(?!।)/);
    if (parts.length >= 2) {
      // Re-join parts if there are more than 2, keeping formatting
      const line1 = parts[0].trim() + ' ।';
      const line2 = parts.slice(1).join(' ।').trim();
      return `${line1}\n${line2}`;
    }
  }

  return text;
};

/**
 * Get localized meaning
 */
export const getMeaning = (sloka, translation, language) => {
  if (!sloka) return '';
  
  // For English, use meaning_english
  if (language === LANGUAGES.ENGLISH) {
    return sloka.meaning_english;
  }

  // For other languages, use translation meaning if available
  // Fallback order: translation.meaning -> sloka.meaning_english
  return translation?.meaning || sloka.meaning_english;
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

// Verify supabase is loaded
if (!supabase) {
  console.error('CRITICAL: Supabase client is undefined in dailySlokaService.js');
}

const DAILY_SLOKA_KEY = '@daily_sloka';
const LAST_UPDATE_KEY = '@last_sloka_update';

// Get today's date as YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get stored daily sloka data
const getStoredDailySloka = async () => {
  try {
    const storedData = await AsyncStorage.getItem(DAILY_SLOKA_KEY);
    const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
    
    if (storedData && lastUpdate) {
      return {
        sloka: JSON.parse(storedData),
        lastUpdate,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting stored daily sloka:', error);
    return null;
  }
};

// Store daily sloka data
const storeDailySloka = async (sloka) => {
  try {
    const today = getTodayDate();
    await AsyncStorage.setItem(DAILY_SLOKA_KEY, JSON.stringify(sloka));
    await AsyncStorage.setItem(LAST_UPDATE_KEY, today);
  } catch (error) {
    console.error('Error storing daily sloka:', error);
  }
};

// Get next sloka position
const getNextSlokaPosition = async (currentChapter, currentVerse) => {
  try {
    // Try to get next verse in same chapter
    const { data: nextVerse, error: nextVerseError } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', currentChapter)
      .eq('verse_number', currentVerse + 1)
      .maybeSingle();

    if (!nextVerseError && nextVerse) {
      return nextVerse;
    }

    // If no next verse, move to next chapter's first verse
    const { data: nextChapterVerse, error: nextChapterError } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', currentChapter + 1)
      .eq('verse_number', 1)
      .maybeSingle();

    if (!nextChapterError && nextChapterVerse) {
      return nextChapterVerse;
    }

    // If we've reached the end, start from beginning
    const { data: firstVerse, error: firstVerseError } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', 1)
      .eq('verse_number', 1)
      .maybeSingle();

    if (!firstVerseError && firstVerse) {
      return firstVerse;
    }

    return null;
  } catch (error) {
    console.error('Error getting next sloka position:', error);
    return null;
  }
};

// Fetch daily sloka with chapter-wise progression
export const fetchDailySloka = async (language = 'en') => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized in fetchDailySloka');
      return null;
    }

    const today = getTodayDate();
    const stored = await getStoredDailySloka();

    // If we have today's sloka, return it
    if (stored && stored.lastUpdate === today) {
      // Refresh translation if language changed
      return await refreshTranslation(stored.sloka, language);
    }

    // Need to fetch new sloka for today
    let newSloka;

    if (stored && stored.sloka) {
      // Get next sloka in sequence
      newSloka = await getNextSlokaPosition(
        stored.sloka.chapter_number,
        stored.sloka.verse_number
      );
    } else {
      // First time - start from Chapter 1, Verse 1
      const { data, error } = await supabase
        .from('slokas')
        .select('*')
        .eq('chapter_number', 1)
        .eq('verse_number', 1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching first sloka:', error);
        return null;
      }
      newSloka = data;
    }

    if (newSloka) {
      // Fetch chapter details
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('chapter_number', newSloka.chapter_number)
        .maybeSingle();

      if (!chapterError && chapter) {
        newSloka.chapter = chapter;
      }

      // Add translation
      newSloka = await refreshTranslation(newSloka, language);

      await storeDailySloka(newSloka);
      return newSloka;
    }

    return null;
  } catch (error) {
    console.error('Error fetching daily sloka:', error);
    return null;
  }
};

// Helper to refresh translation for a sloka
const refreshTranslation = async (sloka, language) => {
  if (!sloka || language === 'en') return sloka;

  try {
    const dbLanguageName = {
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'ml': 'Malayalam',
      'kn': 'Kannada'
    }[language];

    if (dbLanguageName) {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('sloka_id', sloka.id)
        .eq('language', dbLanguageName)
        .maybeSingle();

      if (!error && data) {
        sloka.translation = data;
      }
    }
    return sloka;
  } catch (err) {
    console.error('Error refreshing translation:', err);
    return sloka;
  }
};

// Reset daily sloka (for testing)
export const resetDailySloka = async () => {
  try {
    await AsyncStorage.removeItem(DAILY_SLOKA_KEY);
    await AsyncStorage.removeItem(LAST_UPDATE_KEY);
  } catch (error) {
    console.error('Error resetting daily sloka:', error);
  }
};

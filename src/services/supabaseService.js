import { supabase } from '../config/supabase';

// Verify supabase is loaded
if (!supabase) {
  console.error('CRITICAL: Supabase client is undefined in supabaseService.js');
}

// Fetch all chapters
export const fetchChapters = async () => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }

    console.log('Fetching chapters from Supabase...');
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('chapter_number', { ascending: true });

    if (error) {
      console.error('Supabase error fetching chapters:', error);
      return [];
    }
    
    console.log('Chapters fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Exception fetching chapters:', error);
    return [];
  }
};

// Fetch single chapter by number
export const fetchChapterByNumber = async (chapterNumber) => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
};

// Fetch slokas by chapter with optional translations
export const fetchSlokasWithTranslations = async (chapterNumber, language = 'en') => {
  try {
    const { data: slokas, error: slokaError } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .order('verse_number', { ascending: true });

    if (slokaError) {
      console.error('Error fetching slokas:', slokaError);
      return [];
    }

    if (language !== 'en' && slokas.length > 0) {
      const dbLanguageName = {
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'ml': 'Malayalam',
        'kn': 'Kannada'
      }[language];

      if (dbLanguageName) {
        const slokaIds = slokas.map(s => s.id);
        const { data: translations, error: transError } = await supabase
          .from('translations')
          .select('*')
          .in('sloka_id', slokaIds)
          .eq('language', dbLanguageName);

        if (!transError && translations) {
          slokas.forEach(s => {
            s.translation = translations.find(t => t.sloka_id === s.id);
          });
        }
      }
    }

    return slokas || [];
  } catch (error) {
    console.error('Error fetching slokas:', error);
    return [];
  }
};

// Fetch single sloka with optional translation
export const fetchSloka = async (chapterNumber, slokaNumber, language = 'en') => {
  try {
    const { data: sloka, error: slokaError } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .eq('verse_number', slokaNumber)
      .maybeSingle();

    if (slokaError) {
      console.error('Error fetching sloka:', slokaError);
      return null;
    }

    if (!sloka) return null;

    // Fetch translation if language is not English
    if (language !== 'en') {
      const dbLanguageName = {
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'ml': 'Malayalam',
        'kn': 'Kannada'
      }[language];

      if (dbLanguageName) {
        const { data: translation, error: transError } = await supabase
          .from('translations')
          .select('*')
          .eq('sloka_id', sloka.id)
          .eq('language', dbLanguageName)
          .maybeSingle();

        if (!transError && translation) {
          sloka.translation = translation;
        }
      }
    }

    return sloka;
  } catch (error) {
    console.error('Error fetching sloka:', error);
    return null;
  }
};

// Add bookmark
export const addBookmark = async (deviceId, slokaId) => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([
        {
          sloka_id: slokaId,
          device_id: deviceId,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding bookmark:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return [];
  }
};

// Remove bookmark
export const removeBookmark = async (deviceId, slokaId) => {
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('device_id', deviceId)
      .eq('sloka_id', slokaId);

    if (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Fetch user bookmarks with sloka and translations
export const fetchBookmarks = async (deviceId, language = 'en') => {
  try {
    let query = supabase
      .from('bookmarks')
      .select(`
        *,
        slokas (*)
      `)
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });

    const { data: bookmarks, error } = await query;

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }

    if (language !== 'en' && bookmarks.length > 0) {
      const dbLanguageName = {
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'ml': 'Malayalam',
        'kn': 'Kannada'
      }[language];

      if (dbLanguageName) {
        const slokaIds = bookmarks.map(b => b.sloka_id);
        const { data: translations, error: transError } = await supabase
          .from('translations')
          .select('*')
          .in('sloka_id', slokaIds)
          .eq('language', dbLanguageName);

        if (!transError && translations) {
          bookmarks.forEach(b => {
            b.slokas.translation = translations.find(t => t.sloka_id === b.sloka_id);
          });
        }
      }
    }

    return bookmarks || [];
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

// Check if sloka is bookmarked
export const isBookmarked = async (deviceId, slokaId) => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('device_id', deviceId)
      .eq('sloka_id', slokaId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking bookmark:', error);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
};

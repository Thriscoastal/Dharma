import { supabase } from '../config/supabase';

// Search by keyword
export const searchByKeyword = async (keyword) => {
  try {
    const { data, error } = await supabase
      .from('slokas')
      .select('*')
      .or(`sanskrit_text.ilike.%${keyword}%,transliteration.ilike.%${keyword}%,hindi_meaning.ilike.%${keyword}%,english_meaning.ilike.%${keyword}%`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching by keyword:', error);
    throw error;
  }
};

// Search by chapter number
export const searchByChapter = async (chapterNumber) => {
  try {
    const { data, error } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .order('verse_number', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching by chapter:', error);
    throw error;
  }
};

// Search by sloka number
export const searchBySloka = async (chapterNumber, slokaNumber) => {
  try {
    const { data, error } = await supabase
      .from('slokas')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .eq('verse_number', slokaNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching by sloka:', error);
    throw error;
  }
};

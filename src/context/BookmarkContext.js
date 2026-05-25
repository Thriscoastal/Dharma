import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchBookmarks, 
  addBookmark as addBookmarkToDb, 
  removeBookmark as removeBookmarkFromDb, 
  isBookmarked as checkIsBookmarked 
} from '../services/supabaseService';
import { getDeviceId } from '../services/storageService';
import { useLanguage } from './LanguageContext';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    const init = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
      if (id) {
        loadBookmarks(id);
      }
    };
    init();
  }, [language]);

  const loadBookmarks = async (id = deviceId) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchBookmarks(id, language);
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (sloka) => {
    if (!deviceId || !sloka) return;

    const slokaId = sloka.id;
    const isCurrentlyBookmarked = bookmarks.some(b => b.sloka_id === slokaId);

    if (isCurrentlyBookmarked) {
      // Remove
      setBookmarks(prev => prev.filter(b => b.sloka_id !== slokaId));
      await removeBookmarkFromDb(deviceId, slokaId);
    } else {
      // Add
      // Optimistic update - create a partial bookmark object
      const newBookmark = {
        sloka_id: slokaId,
        device_id: deviceId,
        created_at: new Date().toISOString(),
        slokas: sloka
      };
      setBookmarks(prev => [newBookmark, ...prev]);
      
      const result = await addBookmarkToDb(deviceId, slokaId);
      if (!result || result.length === 0) {
        // Rollback if failed
        setBookmarks(prev => prev.filter(b => b.sloka_id !== slokaId));
      } else {
        // Update with full data from DB if needed, or just keep optimistic
        // loadBookmarks(); 
      }
    }
  };

  const isSlokaBookmarked = (slokaId) => {
    return bookmarks.some(b => b.sloka_id === slokaId);
  };

  return (
    <BookmarkContext.Provider 
      value={{ 
        bookmarks, 
        loading, 
        toggleBookmark, 
        isSlokaBookmarked,
        refreshBookmarks: loadBookmarks 
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

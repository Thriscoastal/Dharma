import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  THEME: '@dharma_theme',
  LANGUAGE: '@dharma_language',
  NOTIFICATION_TIME: '@dharma_notification_time',
  NOTIFICATION_ENABLED: '@dharma_notification_enabled',
  LAST_READ: '@dharma_last_read',
  USER_ID: '@dharma_user_id',
};

// Theme
export const saveTheme = async (isDark) => {
  try {
    await AsyncStorage.setItem(KEYS.THEME, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem(KEYS.THEME);
    return theme ? JSON.parse(theme) : false;
  } catch (error) {
    console.error('Error getting theme:', error);
    return false;
  }
};

// Language
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const getLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(KEYS.LANGUAGE);
    return language || 'english';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'english';
  }
};

// Notification Time
export const saveNotificationTime = async (time) => {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATION_TIME, time);
  } catch (error) {
    console.error('Error saving notification time:', error);
  }
};

export const getNotificationTime = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.NOTIFICATION_TIME);
  } catch (error) {
    console.error('Error getting notification time:', error);
    return null;
  }
};

// Notification Enabled
export const saveNotificationEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATION_ENABLED, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving notification enabled:', error);
  }
};

export const getNotificationEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(KEYS.NOTIFICATION_ENABLED);
    return enabled ? JSON.parse(enabled) : true;
  } catch (error) {
    console.error('Error getting notification enabled:', error);
    return true;
  }
};

// Last Read Position
export const saveLastRead = async (chapterNumber, slokaNumber) => {
  try {
    await AsyncStorage.setItem(
      KEYS.LAST_READ,
      JSON.stringify({ chapterNumber, slokaNumber })
    );
  } catch (error) {
    console.error('Error saving last read:', error);
  }
};

export const getLastRead = async () => {
  try {
    const lastRead = await AsyncStorage.getItem(KEYS.LAST_READ);
    return lastRead ? JSON.parse(lastRead) : null;
  } catch (error) {
    console.error('Error getting last read:', error);
    return null;
  }
};

// User ID (for bookmarks) - renamed to Device ID
export const saveDeviceId = async (deviceId) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_ID, deviceId);
  } catch (error) {
    console.error('Error saving device ID:', error);
  }
};

export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(KEYS.USER_ID);
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await saveDeviceId(deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
};

// Keep old function names for backward compatibility
export const getUserId = getDeviceId;
export const saveUserId = saveDeviceId;


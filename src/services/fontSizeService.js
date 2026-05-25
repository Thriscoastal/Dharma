import AsyncStorage from '@react-native-async-storage/async-storage';

const FONT_SIZE_KEY = '@font_size_numeric';

// Numeric font size (12-24)
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;
export const DEFAULT_FONT_SIZE = 16;

// Calculate scaled sizes based on base size
export const getScaledSizes = (baseSize) => {
  const scale = baseSize / DEFAULT_FONT_SIZE;
  return {
    xsmall: Math.round(baseSize * 0.75),     // 12px at default
    small: Math.round(baseSize * 0.875),      // 14px at default
    base: baseSize,
    large: Math.round(baseSize * 1.125),      // 18px at default
    heading: Math.round(baseSize * 1.375),    // 22px at default
    title: Math.round(baseSize * 1.75),       // 28px at default
    sanskrit: Math.round(baseSize * 1.25),    // 20px at default
  };
};

export const getFontSize = async () => {
  try {
    const size = await AsyncStorage.getItem(FONT_SIZE_KEY);
    return size ? parseInt(size) : DEFAULT_FONT_SIZE;
  } catch (error) {
    console.error('Error getting font size:', error);
    return DEFAULT_FONT_SIZE;
  }
};

export const saveFontSize = async (size) => {
  try {
    await AsyncStorage.setItem(FONT_SIZE_KEY, size.toString());
  } catch (error) {
    console.error('Error saving font size:', error);
  }
};

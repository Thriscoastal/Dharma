import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SPACING } from '../constants/colors';

import { useTheme } from '../context/ThemeContext';

const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const { isDark } = useTheme();
  const [searchText, setSearchText] = useState('');
  const styles = getStyles(isDark);

  const handleTextChange = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <Icon name="search" size={24} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary}
        value={searchText}
        onChangeText={handleTextChange}
        returnKeyType="search"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} activeOpacity={0.7}>
          <Icon name="close" size={24} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderRadius: RADIUS.button,
      paddingHorizontal: SPACING.card,
      marginHorizontal: SPACING.page,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    icon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    clearButton: {
      padding: 4,
    },
  });

export default SearchBar;

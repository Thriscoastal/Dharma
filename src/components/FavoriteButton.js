import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { COLORS } from '../constants/colors';

import { useTheme } from '../context/ThemeContext';

const FavoriteButton = ({ isFavorite, onPress }) => {
  const { isDark } = useTheme();
  const saffron = isDark ? COLORS.saffronLight : COLORS.saffron;
  const muted = isDark ? COLORS.darkTextSecondary : COLORS.textSecondary;

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Icon
        name={isFavorite ? 'bookmark' : 'bookmark-border'}
        size={28}
        color={isFavorite ? saffron : muted}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default FavoriteButton;

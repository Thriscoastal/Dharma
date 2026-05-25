import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../constants/colors';

import { useTheme } from '../context/ThemeContext';

const SlokaCard = ({ sloka, onPress }) => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.verseNumberBadge}>
          <Text style={styles.verseNumberText}>{sloka.verse_number}</Text>
        </View>
        <Text style={styles.chapterText}>
          Chapter {sloka.chapter_number}
        </Text>
      </View>
      
      {sloka.sanskrit && (
        <Text style={styles.sanskritText} numberOfLines={2}>
          {sloka.sanskrit}
        </Text>
      )}
      
      {sloka.transliteration && (
        <Text style={styles.transliteration} numberOfLines={2}>
          {sloka.transliteration}
        </Text>
      )}
      
      {sloka.meaning_english && (
        <Text style={styles.meaning} numberOfLines={3}>
          {sloka.meaning_english}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
      borderRadius: RADIUS.card,
      padding: SPACING.large,
      marginVertical: SPACING.small,
      marginHorizontal: SPACING.medium,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.primary,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? COLORS.darkBorder : 'transparent',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    verseNumberBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.small,
    },
    verseNumberText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    chapterText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sanskritText: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: SPACING.small,
      lineHeight: 26,
    },
    transliteration: {
      fontSize: 14,
      fontStyle: 'italic',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginBottom: SPACING.small,
      lineHeight: 20,
    },
    meaning: {
      fontSize: 14,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      lineHeight: 22,
    },
  });

export default SlokaCard;

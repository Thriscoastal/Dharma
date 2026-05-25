import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SPACING } from '../constants/colors';

import { getChapterName } from '../services/contentService';

import { useTranslation } from '../hooks/useTranslation';

import { useTheme } from '../context/ThemeContext';

const ChapterItem = ({ chapter, onPress, scaledSizes, language }) => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark, scaledSizes);
  const localizedName = getChapterName(chapter, language);
  const t = useTranslation();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{chapter.chapter_number}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{localizedName}</Text>
        <Text style={styles.subtitle}>{chapter.name_sanskrit}</Text>
        <Text style={styles.slokaCount}>{chapter.sloka_count} {t('chapters.versesCount')}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface, // Use darkCard for dark mode
      borderRadius: RADIUS.card,
      paddingVertical: SPACING.medium, // Adjusted padding
      paddingHorizontal: SPACING.large,
      marginVertical: SPACING.xsmall, // Reduced vertical margin for tighter list
      marginHorizontal: SPACING.medium, // Consistent horizontal margin
      // Premium Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
      borderWidth: StyleSheet.hairlineWidth, // Subtle border
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    numberContainer: {
      width: 56, // Larger width
      height: 56, // Larger height
      borderRadius: RADIUS.large, // Consistent border radius
      backgroundColor: COLORS.accentGold, // Gold accent for chapter number
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.medium, // Adjusted spacing
      shadowColor: COLORS.shadow, // Subtle shadow for number container
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    number: {
      fontSize: scaledSizes.large, // Use scaled size for number
      fontWeight: '800', // Bolder
      color: '#FFFFFF', // White text on gold
    },
    content: {
      flex: 1,
      marginRight: SPACING.small, // Add some right margin
    },
    title: {
      fontSize: scaledSizes.base * 1.1, // Slightly larger base
      fontWeight: '700', // Bolder
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: SPACING.xsmall,
      lineHeight: scaledSizes.base * 1.1 * 1.3,
    },
    subtitle: {
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginBottom: SPACING.xsmall,
      fontStyle: 'italic', // Italicize Sanskrit
      lineHeight: scaledSizes.small * 1.4,
    },
    meaning: {
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginBottom: SPACING.xsmall,
      lineHeight: scaledSizes.small * 1.4,
    },
    slokaCount: {
      fontSize: scaledSizes.xsmall, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      fontWeight: '500',
      marginTop: SPACING.xsmall,
    },
  });

export default ChapterItem;

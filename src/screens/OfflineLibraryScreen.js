import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getAllOfflineSlokas,
  removeSlokaOffline,
} from '../services/offlineService';
import { getChapterName, getSlokaText } from '../services/contentService';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Pull chapter/verse numbers regardless of which field name the row actually uses
const getChapterNum = (sloka) =>
  sloka?.chapter_number ?? sloka?.chapterNumber ?? null;

const getVerseNum = (sloka) =>
  sloka?.verse_number ?? sloka?.sloka_number ?? sloka?.slokaNumber ?? null;

const OfflineLibraryScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { scaledSizes } = useFontSize();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);

  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');

  const loadOfflineItems = useCallback(async () => {
    setLoading(true);
    const records = await getAllOfflineSlokas();
    records.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    setItems(records);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOfflineItems();
    }, [loadOfflineItems])
  );

    const handleOpen = (record) => {
      const chapterNumber = getChapterNum(record.sloka);
      const slokaNumber = getVerseNum(record.sloka);

      if (!chapterNumber || !slokaNumber) {
        console.warn('Offline record missing chapter/verse number', record);
        return;
      }

      navigation.navigate('SlokaDetailOffline', { chapterNumber, slokaNumber });
    };

  const handleRemove = async (record) => {
    const chapterNumber = getChapterNum(record.sloka);
    const slokaNumber = getVerseNum(record.sloka);
    if (chapterNumber && slokaNumber) {
      await removeSlokaOffline(chapterNumber, slokaNumber);
    }
    loadOfflineItems();
  };

  const renderItem = ({ item }) => {
    const chapterName = getChapterName(item.chapter, language);
    const verseText = getSlokaText(item.sloka, item.sloka.translation, language);
    const hasAudio = !!(item.recitationAudioPath || item.meaningAudioPath);
    const chapterNumber = getChapterNum(item.sloka);
    const verseNumber = getVerseNum(item.sloka);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleOpen(item)} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <View style={styles.chip}>
            <Text style={[styles.chipText, { color: gold }]}>
              Ch {chapterNumber} · V {verseNumber}
            </Text>
          </View>
          {hasAudio && (
            <Icon name="volume-up" size={16} color={gold} style={{ marginLeft: 6 }} />
          )}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="delete-outline" size={20} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.chapterName} numberOfLines={1}>{chapterName}</Text>
        <Text style={styles.verseText} numberOfLines={2}>{verseText}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? COLORS.darkBackground : COLORS.background} />

      {/* Simple back button, no title bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}>
          <Icon name="arrow-back" size={24} color={gold} />
        </TouchableOpacity>
      </View>

      {!loading && items.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="offline-pin" size={48} color={isDark ? COLORS.darkBorder : COLORS.border} />
          <Text style={styles.emptyText}>No slokas saved for offline yet</Text>
          <Text style={styles.emptySubtext}>
            Open any verse and tap "Download for Offline" to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) =>
            `${getChapterNum(item.sloka) ?? 'x'}_${getVerseNum(item.sloka) ?? index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: SPACING.xlarge,
      paddingBottom: SPACING.small,
      paddingHorizontal: SPACING.medium,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    listContent: {
      padding: SPACING.medium,
      paddingBottom: SPACING.xlarge,
    },
    card: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      padding: SPACING.medium,
      marginBottom: SPACING.small,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    chip: {
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
      borderRadius: 30,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    chipText: {
      fontSize: scaledSizes.small * 0.85,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    removeBtn: {
      marginLeft: 'auto',
    },
    chapterName: {
      fontSize: scaledSizes.small,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: 4,
    },
    verseText: {
      fontSize: scaledSizes.small,
      lineHeight: scaledSizes.small * 1.5,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      fontStyle: 'italic',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xlarge,
    },
    emptyText: {
      fontSize: scaledSizes.base,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginTop: SPACING.medium,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginTop: 6,
      textAlign: 'center',
    },
  });

export default OfflineLibraryScreen;
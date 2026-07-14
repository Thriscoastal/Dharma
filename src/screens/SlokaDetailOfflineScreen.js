import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getOfflineSloka,
  removeSlokaOffline,
} from '../services/offlineService';
import { getChapterName, getSlokaText, getMeaning } from '../services/contentService';
import AudioPlayer from '../components/AudioPlayer';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';

// ─── Lotus Divider ────────────────────────────────────────────────────────
const LotusLine = ({ color, goldColor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
    <Text style={{ color: goldColor, fontSize: 18, marginHorizontal: 2 }}>🪷</Text>
    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────
const SlokaDetailOfflineScreen = ({ route, navigation }) => {
  const { chapterNumber, slokaNumber } = route?.params || {};
  const { isDark } = useTheme();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);

  const { scaledSizes } = useFontSize();
  const { language } = useLanguage();
  const { isSlokaBookmarked, toggleBookmark: toggleGlobalBookmark } = useBookmarks();

  const sloka = record?.sloka || null;
  const chapter = record?.chapter || null;
  const isFavorite = sloka ? isSlokaBookmarked(sloka.id) : false;

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);

  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;
  const bookmarkAnim = useRef(new Animated.Value(1)).current;

  const animateContentIn = () => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    isMounted.current = true;
    if (chapterNumber && slokaNumber) {
      loadOfflineData();
    } else {
      setError('Invalid verse parameters');
      setLoading(false);
    }
    return () => {
      isMounted.current = false;
    };
  }, [chapterNumber, slokaNumber]);

  const loadOfflineData = async () => {
    try {
      setLoading(true);
      setError(null);
      contentAnim.setValue(0);
      contentSlide.setValue(20);

      const cached = await getOfflineSloka(chapterNumber, slokaNumber);

      if (!isMounted.current) return;

      if (cached) {
        setRecord(cached);
        animateContentIn();
      } else {
        setError('This verse is not saved for offline reading');
      }
    } catch (err) {
      if (isMounted.current) setError('Failed to load offline content');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!sloka) return;
    Animated.sequence([
      Animated.timing(bookmarkAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
      Animated.timing(bookmarkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    toggleGlobalBookmark(sloka);
  };

  const handleRemoveOffline = async () => {
    await removeSlokaOffline(chapterNumber, slokaNumber);
    navigation.goBack();
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTab');
    }
  };

  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const saffron = isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00');
  const headerBg = isDark ? (COLORS.darkSurface || '#2C2C2C') : (COLORS.primary || '#FF8C00');

  // ── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
        <Text style={[styles.omLoader, { color: gold }]}>ॐ</Text>
        <Text style={styles.loadingText}>Loading offline copy...</Text>
      </View>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────
  if (error || !sloka || !chapter) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
        <Icon name="offline-pin" size={48} color={isDark ? COLORS.darkBorder : COLORS.border} />
        <Text style={styles.errorText}>{error || 'Verse not found offline'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const localizedChapterName = getChapterName(chapter, language);
  const localizedSlokaText = getSlokaText(sloka, sloka.translation, language);
  const localizedMeaning = getMeaning(sloka, sloka.translation, language);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.8}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerOm, { color: gold }]}>ॐ</Text>
          <Text style={styles.headerChapterName} numberOfLines={1}>
            {localizedChapterName}
          </Text>
          <Text style={styles.headerVerseNum}>
            Verse {slokaNumber}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={handleToggleBookmark} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
            <Icon
              name={isFavorite ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={isFavorite ? gold : '#FFF'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Offline badge */}
        <View style={styles.offlineBanner}>
          <Icon name="offline-pin" size={14} color={gold} />
          <Text style={[styles.offlineBannerText, { color: gold }]}>
            Offline copy
          </Text>
        </View>

        {/* Verse Card */}
        <Animated.View
          style={[
            styles.verseCard,
            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
          ]}>
          <View style={[styles.verseStrip, { backgroundColor: gold }]} />
          <View style={styles.verseCardInner}>
            <View style={styles.verseRefRow}>
              <View style={styles.verseChip}>
                <Text style={[styles.verseChipText, { color: gold }]}>
                  Chapter {chapterNumber}  ·  Verse {slokaNumber}
                </Text>
              </View>
            </View>
            <Text style={styles.verseText}>{localizedSlokaText}</Text>
          </View>
        </Animated.View>

        {/* Recitation Audio (offline file only) */}
        {record.recitationAudioPath && (
          <Animated.View style={[styles.audioCard, { opacity: contentAnim }]}>
            <View style={styles.audioLabel}>
              <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
              <Text style={[styles.audioLabelText, { color: saffron }]}>Recitation</Text>
            </View>
            <AudioPlayer
              audioUrl={record.recitationAudioPath}
              duration={sloka.audio_duration}
              chapterNumber={chapterNumber}
              verseNumber={slokaNumber}
              isDark={isDark}
            />
          </Animated.View>
        )}

        {/* Translation / Meaning */}
        <Animated.View
          style={[
            styles.meaningCard,
            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
          ]}>
          <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} goldColor={gold} />

          <View style={styles.meaningHeader}>
            <Text style={[styles.meaningLabel, { color: gold }]}>TRANSLATION</Text>
          </View>

          {record.meaningAudioPath && (
            <View style={styles.audioContainer}>
              <View style={styles.audioLabel}>
                <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
                <Text style={[styles.audioLabelText, { color: saffron }]}>GURU VOICE</Text>
              </View>
              <AudioPlayer
                audioUrl={record.meaningAudioPath}
                duration={0}
                chapterNumber={chapterNumber}
                verseNumber={slokaNumber}
              />
            </View>
          )}

          <Text style={styles.meaningText}>{localizedMeaning}</Text>
        </Animated.View>

        {/* Remove from offline */}
        <TouchableOpacity style={styles.removeOfflineBtn} onPress={handleRemoveOffline} activeOpacity={0.8}>
          <Icon name="delete-outline" size={18} color={saffron} />
          <Text style={[styles.removeOfflineText, { color: saffron }]}>
            Remove from Offline Library
          </Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────
const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.large,
    },
    omLoader: {
      fontSize: 64,
      textAlign: 'center',
      marginBottom: SPACING.medium,
    },
    loadingText: {
      fontSize: scaledSizes.base,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    errorText: {
      fontSize: scaledSizes.base,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: scaledSizes.base * 1.6,
      marginVertical: SPACING.large,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.xlarge,
      paddingVertical: SPACING.medium,
      borderRadius: 50,
    },
    retryButtonText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: scaledSizes.base,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: SPACING.xlarge,
      paddingBottom: SPACING.medium,
      paddingHorizontal: SPACING.medium,
      borderBottomWidth: 2,
      borderBottomColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: SPACING.small,
    },
    headerOm: {
      fontSize: 16,
      marginBottom: 2,
    },
    headerChapterName: {
      color: '#FFF',
      fontSize: scaledSizes.base,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    headerVerseNum: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: scaledSizes.small,
      marginTop: 2,
      letterSpacing: 0.5,
    },

    scroll: { flex: 1 },
    scrollContent: {
      padding: SPACING.medium,
      paddingBottom: SPACING.xlarge,
    },

    offlineBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      marginBottom: SPACING.small,
      gap: 4,
    },
    offlineBannerText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    verseCard: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      overflow: 'hidden',
      marginBottom: SPACING.medium,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    verseStrip: { height: 3 },
    verseCardInner: { padding: SPACING.large },
    verseRefRow: {
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    verseChip: {
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
      borderRadius: 30,
      paddingHorizontal: 14,
      paddingVertical: 5,
    },
    verseChipText: {
      fontSize: scaledSizes.small,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    verseText: {
      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.15,
      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.15) * 1.7,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      textAlign: 'center',
      fontStyle: 'italic',
      fontWeight: '500',
    },

    audioCard: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      overflow: 'hidden',
      marginBottom: SPACING.medium,
      padding: SPACING.small,
    },
    audioLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.small,
      paddingTop: SPACING.small,
      paddingBottom: 4,
    },
    audioLabelText: {
      fontSize: scaledSizes.small,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    meaningCard: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      borderLeftWidth: 3,
      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      padding: SPACING.large,
      marginBottom: SPACING.medium,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    meaningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    meaningLabel: {
      fontSize: scaledSizes.small,
      fontWeight: '800',
      letterSpacing: 2,
    },
    meaningText: {
      fontSize: scaledSizes.base,
      lineHeight: scaledSizes.base * 1.75,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      textAlign: 'justify',
    },

    audioContainer: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      padding: SPACING.small,
      marginBottom: SPACING.medium,
    },

    removeOfflineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      gap: 8,
      marginBottom: SPACING.medium,
    },
    removeOfflineText: {
      fontWeight: '700',
      fontSize: scaledSizes.small,
    },
  });

export default SlokaDetailOfflineScreen;
////import React, { useState, useEffect, useRef } from 'react';
////import {
////  View,
////  Text,
////  StyleSheet,
////  ScrollView,
////  TouchableOpacity,
////  Dimensions,
////  Animated,
////  StatusBar,
////} from 'react-native';
////import Icon from 'react-native-vector-icons/MaterialIcons';
////import {
////  fetchSloka,
////  fetchChapterByNumber,
////} from '../services/supabaseService';
////import { getUserId, saveLastRead } from '../services/storageService';
////import { getChapterName, getSlokaText, getMeaning } from '../services/contentService';
////import { generateMeaningAudio } from '../services/ttsService';
////import AudioPlayer from '../components/AudioPlayer';
////import { SPACING, RADIUS, COLORS } from '../constants/colors';
////import { useFontSize } from '../context/FontSizeContext';
////import { useTranslation } from '../hooks/useTranslation';
////import { useLanguage } from '../context/LanguageContext';
////import { useBookmarks } from '../context/BookmarkContext';
////import { useTheme } from '../context/ThemeContext';
////
////const { width } = Dimensions.get('window');
////
////// ─── Lotus Divider ────────────────────────────────────────────────────────
////const LotusLine = ({ color, goldColor }) => (
////  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
////    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
////    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
////    <Text style={{ color: goldColor, fontSize: 18, marginHorizontal: 2 }}>🪷</Text>
////    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
////    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
////  </View>
////);
////
////// ─── Main Screen ──────────────────────────────────────────────────────────
////const SlokaDetailScreen = ({ route, navigation }) => {
////  const { chapterNumber, slokaNumber } = route?.params || {};
////  const { isDark } = useTheme();
////
////  const [sloka, setSloka] = useState(null);
////  const [chapter, setChapter] = useState(null);
////  const [loading, setLoading] = useState(true);
////  const [userId, setUserId] = useState(null);
////  const [error, setError] = useState(null);
////  const [ttsLoading, setTtsLoading] = useState(false);
////  const [ttsError, setTtsError] = useState(null);
////  const [meaningAudioUrl, setMeaningAudioUrl] = useState(null);
////  const isMounted = useRef(true);
////
////  const { scaledSizes } = useFontSize();
////  const t = useTranslation();
////  const { language } = useLanguage();
////  const { isSlokaBookmarked, toggleBookmark: toggleGlobalBookmark } = useBookmarks();
////
////  const isFavorite = sloka ? isSlokaBookmarked(sloka.id) : false;
////
////  // Hoisted cleanup functions
////  function stopMeaningAudio() {
////    if (isMounted.current) {
////      setMeaningAudioUrl(null);
////    }
////  }
////
////  function stopSlokaAudio() {
////    // Recitation AudioPlayer is tied to sloka.audio_url
////  }
////
////  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);
////
////  // Content fade-in
////  const contentAnim = useRef(new Animated.Value(0)).current;
////  const contentSlide = useRef(new Animated.Value(20)).current;
////
////  // Pulse for loading Om
////  const pulseAnim = useRef(new Animated.Value(1)).current;
////
////  // Bookmark bounce
////  const bookmarkAnim = useRef(new Animated.Value(1)).current;
////
////  const pulseAnimRef = useRef(null);
////  useEffect(() => {
////    const anim = Animated.loop(
////      Animated.sequence([
////        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
////        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
////      ])
////    );
////    pulseAnimRef.current = anim;
////    anim.start();
////    return () => {
////      if (pulseAnimRef.current) {
////        pulseAnimRef.current.stop();
////        pulseAnimRef.current = null;
////      }
////      stopMeaningAudio();
////      stopSlokaAudio();
////    };
////  }, [pulseAnim]);
////
////  useEffect(() => {
////    initUser();
////  }, []);
////
////  useEffect(() => {
////    isMounted.current = true;
////    if (chapterNumber && slokaNumber) {
////      loadData();
////    } else {
////      setError('Invalid verse parameters');
////      setLoading(false);
////    }
////    return () => {
////      isMounted.current = false;
////      stopMeaningAudio();
////      stopSlokaAudio();
////    };
////  }, [chapterNumber, slokaNumber, language]);
////
////  const animateContentIn = () => {
////    Animated.parallel([
////      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
////      Animated.timing(contentSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
////    ]).start();
////  };
////
////  const initUser = async () => {
////    try {
////      const id = await getUserId();
////      if (isMounted.current) setUserId(id);
////    } catch (e) {}
////  };
////
////  const loadData = async () => {
////    try {
////      if (!isMounted.current) return;
////      setLoading(true);
////      setError(null);
////      stopMeaningAudio();
////
////      const [slokaData, chapterData] = await Promise.all([
////        fetchSloka(chapterNumber, slokaNumber, language),
////        fetchChapterByNumber(chapterNumber),
////      ]);
////
////      if (!isMounted.current) return;
////
////      if (slokaData && chapterData) {
////        setSloka(slokaData);
////        setChapter(chapterData);
////        saveLastRead(chapterNumber, slokaNumber).catch(() => {});
////        animateContentIn();
////      } else {
////        setError(t('verse.verseNotFound'));
////      }
////    } catch (err) {
////      if (isMounted.current) setError('Failed to load content');
////    } finally {
////      if (isMounted.current) setLoading(false);
////    }
////  };
////
////  const handleToggleBookmark = () => {
////    if (!sloka) return;
////    // Bounce animation
////    Animated.sequence([
////      Animated.timing(bookmarkAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
////      Animated.timing(bookmarkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
////    ]).start();
////
////    toggleGlobalBookmark(sloka);
////  };
////
////  const handleGenerateMeaningAudio = async () => {
////    if (ttsLoading || !sloka) return;
////
////    setTtsLoading(true);
////    setTtsError(null);
////
////    try {
////      const localizedMeaning = getMeaning(sloka, sloka.translation, language);
////      const url = await generateMeaningAudio(localizedMeaning, language);
////      setMeaningAudioUrl(url);
////    } catch (err) {
////      setTtsError(t('common.error') || 'Audio generation failed');
////      setTimeout(() => setTtsError(null), 3000);
////    } finally {
////      setTtsLoading(false);
////    }
////  };
////
////  const handleGoBack = () => {
////    stopMeaningAudio();
////    if (navigation.canGoBack()) {
////      navigation.goBack();
////    } else {
////      navigation.navigate('ChaptersTab', { screen: 'ChaptersList' });
////    }
////  };
////
////  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
////  const saffron = isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00');
////  const headerBg = isDark ? (COLORS.darkSurface || '#2C2C2C') : (COLORS.primary || '#FF8C00');
////
////  // ── Loading State ─────────────────────────────────────────────────────
////  if (loading) {
////    return (
////      <View style={[styles.container, styles.centerContent]}>
////        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
////          ॐ
////        </Animated.Text>
////        <Text style={styles.loadingText}>{t('common.loading')}</Text>
////      </View>
////    );
////  }
////
////  // ── Error State ───────────────────────────────────────────────────────
////  if (error || !sloka || !chapter) {
////    return (
////      <View style={[styles.container, styles.centerContent]}>
////        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////        <Text style={[styles.omLoader, { color: gold }]}>ॐ</Text>
////        <Text style={styles.errorText}>{error || t('common.error')}</Text>
////        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack} activeOpacity={0.8}>
////          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
////        </TouchableOpacity>
////      </View>
////    );
////  }
////
////  const localizedChapterName = getChapterName(chapter, language);
////  const localizedSlokaText = getSlokaText(sloka, sloka.translation, language);
////  const localizedMeaning = getMeaning(sloka, sloka.translation, language);
////
////  return (
////    <View style={styles.container}>
////      <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////
////      {/* ── Decorative Header ── */}
////      <View style={[styles.header, { backgroundColor: headerBg }]}>
////        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.8}>
////          <Icon name="arrow-back" size={22} color="#FFF" />
////        </TouchableOpacity>
////
////        <View style={styles.headerCenter}>
////          {/* Om symbol above title */}
////          <Text style={[styles.headerOm, { color: gold }]}>ॐ</Text>
////          <Text style={styles.headerChapterName} numberOfLines={1}>
////            {localizedChapterName}
////          </Text>
////          <Text style={styles.headerVerseNum}>
////            {t('sloka.verse')} {slokaNumber}
////          </Text>
////        </View>
////
////        <TouchableOpacity style={styles.headerBtn} onPress={handleToggleBookmark} activeOpacity={0.8}>
////          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
////            <Icon
////              name={isFavorite ? 'bookmark' : 'bookmark-border'}
////              size={22}
////              color={isFavorite ? gold : '#FFF'}
////            />
////          </Animated.View>
////        </TouchableOpacity>
////      </View>
////
////      {/* ── Content ── */}
////      <Animated.ScrollView
////        style={styles.scroll}
////        contentContainerStyle={styles.scrollContent}
////        showsVerticalScrollIndicator={false}>
////
////        {/* Verse Card */}
////        <Animated.View
////          style={[
////            styles.verseCard,
////            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
////          ]}>
////          {/* Gold top strip */}
////          <View style={[styles.verseStrip, { backgroundColor: gold }]} />
////          <View style={styles.verseCardInner}>
////            <View style={styles.verseRefRow}>
////              <View style={styles.verseChip}>
////                <Text style={[styles.verseChipText, { color: gold }]}>
////                  {t('chapters.chapter')} {chapterNumber}  ·  {t('sloka.verse')} {slokaNumber}
////                </Text>
////              </View>
////            </View>
////            <Text style={styles.verseText}>{localizedSlokaText}</Text>
////          </View>
////        </Animated.View>
////
////        {/* Audio Player */}
////        {sloka.audio_url && (
////          <Animated.View
////            style={[
////              styles.audioCard,
////              { opacity: contentAnim },
////            ]}>
////            <View style={styles.audioLabel}>
////              <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
////              <Text style={[styles.audioLabelText, { color: saffron }]}>{t('sloka.playAudio') || 'Recitation'}</Text>
////            </View>
////            <AudioPlayer
////              audioUrl={sloka.audio_url}
////              duration={sloka.audio_duration}
////              chapterNumber={chapterNumber}
////              verseNumber={slokaNumber}
////              isDark={isDark}
////            />
////          </Animated.View>
////        )}
////
////        {/* Translation / Meaning */}
////        <Animated.View
////          style={[
////            styles.meaningCard,
////            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
////          ]}>
////          <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} goldColor={gold} />
////
////          <View style={styles.meaningHeader}>
////            <Text style={[styles.meaningLabel, { color: gold }]}>
////              {t('sloka.translation').toUpperCase()}/
////            </Text>
////          </View>
////
////          {meaningAudioUrl ? (
////            <View style={styles.audioContainer}>
////              <View style={styles.audioLabel}>
////                <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
////                <Text style={[styles.audioLabelText, { color: saffron }]}>GURU VOICE</Text>
////              </View>
////              <AudioPlayer
////                audioUrl={meaningAudioUrl}
////                duration={0}
////                chapterNumber={chapterNumber}
////                verseNumber={slokaNumber}
////              />
////            </View>
////          ) : (
////            <TouchableOpacity
////              style={[styles.ttsBtn, ttsLoading && styles.ttsBtnDisabled]}
////              onPress={handleGenerateMeaningAudio}
////              disabled={ttsLoading}
////              activeOpacity={0.7}
////            >
////              {ttsLoading ? (
////                <View style={styles.loaderContainer}>
////                   <Icon name="sync" size={18} color={gold} />
////                </View>
////              ) : (
////                <Icon name="play-circle-outline" size={24} color={gold} />
////              )}
////              <Text style={[styles.ttsBtnText, { color: gold }]}>
////                {ttsLoading ? (t('common.loading') || 'GENERATING...') : 'LISTEN MEANING'}
////              </Text>
////            </TouchableOpacity>
////          )}
////
////          {ttsError && (
////            <Text style={styles.ttsErrorText}>{ttsError}</Text>
////          )}
////
////          <Text style={styles.meaningText}>{localizedMeaning}</Text>
////        </Animated.View>
////
////      </Animated.ScrollView>
////
////      {/* ── Navigation Footer ── */}
////      <View style={styles.footer}>
////        {/* Prev */}
////        <TouchableOpacity
////          style={[styles.navBtn, slokaNumber <= 1 && styles.navBtnDisabled]}
////          disabled={slokaNumber <= 1}
////          onPress={() =>
////            navigation.push('SlokaDetail', {
////              chapterNumber,
////              slokaNumber: slokaNumber - 1,
////            })
////          }
////          activeOpacity={0.8}>
////          <Icon name="chevron-left" size={26} color={slokaNumber <= 1 ? (isDark ? COLORS.darkBorder : COLORS.border) : gold} />
////        </TouchableOpacity>
////
////        {/* Save Button */}
////        <TouchableOpacity
////          style={[styles.saveBtn, isFavorite && styles.saveBtnActive]}
////          onPress={handleToggleBookmark}
////          activeOpacity={0.85}>
////          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
////            <Icon
////              name={isFavorite ? 'bookmark' : 'bookmark-border'}
////              size={20}
////              color="#FFF"
////            />
////          </Animated.View>
////          <Text style={styles.saveBtnText}>
////            {isFavorite ? 'Saved Sloka' : 'Save Sloka'}
////          </Text>
////        </TouchableOpacity>
////
////        {/* Next */}
////        <TouchableOpacity
////          style={styles.navBtn}
////          onPress={() =>
////            navigation.push('SlokaDetail', {
////              chapterNumber,
////              slokaNumber: slokaNumber + 1,
////            })
////          }
////          activeOpacity={0.8}>
////          <Icon name="chevron-right" size={26} color={gold} />
////        </TouchableOpacity>
////      </View>
////    </View>
////  );
////};
////
////// ─── Styles ───────────────────────────────────────────────────────────────
////const getStyles = (isDark, scaledSizes) =>
////  StyleSheet.create({
////    container: {
////      flex: 1,
////      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
////    },
////    centerContent: {
////      flex: 1,
////      justifyContent: 'center',
////      alignItems: 'center',
////      padding: SPACING.large,
////    },
////
////    // ── Loading / Error ──
////    omLoader: {
////      fontSize: 64,
////      textAlign: 'center',
////      marginBottom: SPACING.medium,
////    },
////    loadingText: {
////      fontSize: scaledSizes.base,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      letterSpacing: 1.5,
////      textTransform: 'uppercase',
////      marginTop: SPACING.small,
////    },
////    errorText: {
////      fontSize: scaledSizes.base,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      textAlign: 'center',
////      lineHeight: scaledSizes.base * 1.6,
////      marginVertical: SPACING.large,
////    },
////    retryButton: {
////      backgroundColor: COLORS.primary,
////      paddingHorizontal: SPACING.xlarge,
////      paddingVertical: SPACING.medium,
////      borderRadius: 50,
////    },
////    retryButtonText: {
////      color: '#FFF',
////      fontWeight: '700',
////      fontSize: scaledSizes.base,
////    },
////
////    // ── Header ──
////    header: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      paddingTop: SPACING.xlarge,
////      paddingBottom: SPACING.medium,
////      paddingHorizontal: SPACING.medium,
////      // Bottom gold border accent
////      borderBottomWidth: 2,
////      borderBottomColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 3 },
////      shadowOpacity: 0.3,
////      shadowRadius: 6,
////      elevation: 8,
////    },
////    headerBtn: {
////      width: 40,
////      height: 40,
////      borderRadius: 20,
////      backgroundColor: 'rgba(255,255,255,0.12)',
////      justifyContent: 'center',
////      alignItems: 'center',
////    },
////    headerCenter: {
////      flex: 1,
////      alignItems: 'center',
////      marginHorizontal: SPACING.small,
////    },
////    headerOm: {
////      fontSize: 16,
////      marginBottom: 2,
////    },
////    headerChapterName: {
////      color: '#FFF',
////      fontSize: scaledSizes.base,
////      fontWeight: '700',
////      letterSpacing: 0.3,
////    },
////    headerVerseNum: {
////      color: 'rgba(255,255,255,0.7)',
////      fontSize: scaledSizes.small,
////      marginTop: 2,
////      letterSpacing: 0.5,
////    },
////
////    // ── Scroll ──
////    scroll: { flex: 1 },
////    scrollContent: {
////      padding: SPACING.medium,
////      paddingBottom: 100,
////    },
////
////    // ── Verse Card ──
////    verseCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      overflow: 'hidden',
////      marginBottom: SPACING.medium,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 4 },
////      shadowOpacity: isDark ? 0.2 : 0.12,
////      shadowRadius: 12,
////      elevation: 6,
////    },
////    verseStrip: {
////      height: 3,
////    },
////    verseCardInner: {
////      padding: SPACING.large,
////    },
////    verseRefRow: {
////      alignItems: 'center',
////      marginBottom: SPACING.medium,
////    },
////    verseChip: {
////      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
////      borderRadius: 30,
////      paddingHorizontal: 14,
////      paddingVertical: 5,
////    },
////    verseChipText: {
////      fontSize: scaledSizes.small,
////      fontWeight: '700',
////      letterSpacing: 1,
////      textTransform: 'uppercase',
////    },
////    verseText: {
////      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.15,
////      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.15) * 1.7,
////      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
////      textAlign: 'center',
////      fontStyle: 'italic',
////      fontWeight: '500',
////    },
////
////    // ── Audio Card ──
////    audioCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      overflow: 'hidden',
////      marginBottom: SPACING.medium,
////      padding: SPACING.small,
////    },
////    audioLabel: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      paddingHorizontal: SPACING.small,
////      paddingTop: SPACING.small,
////      paddingBottom: 4,
////    },
////    audioLabelText: {
////      fontSize: scaledSizes.small,
////      fontWeight: '700',
////      letterSpacing: 1,
////      textTransform: 'uppercase',
////    },
////
////    // ── Meaning Card ──
////    meaningCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      borderLeftWidth: 3,
////      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
////      padding: SPACING.large,
////      marginBottom: SPACING.medium,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 2 },
////      shadowOpacity: 0.08,
////      shadowRadius: 8,
////      elevation: 3,
////    },
////    meaningHeader: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'space-between',
////      marginBottom: SPACING.medium,
////      width: '100%',
////    },
////    meaningLabel: {
////      fontSize: scaledSizes.small,
////      fontWeight: '800',
////      letterSpacing: 2,
////    },
////    meaningText: {
////      fontSize: scaledSizes.base,
////      lineHeight: scaledSizes.base * 1.75,
////      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
////      textAlign: 'justify',
////    },
////
////    // ── TTS Button ──
////    ttsBtn: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
////      paddingHorizontal: 12,
////      paddingVertical: 6,
////      borderRadius: 20,
////      borderWidth: 1,
////      borderColor: 'rgba(212, 175, 55, 0.3)',
////      marginTop: 8,
////    },
////    ttsBtnDisabled: {
////      opacity: 0.6,
////    },
////    ttsBtnText: {
////      fontSize: scaledSizes.small * 0.9,
////      fontWeight: '700',
////      marginLeft: 6,
////      letterSpacing: 0.5,
////    },
////    loaderContainer: {
////      width: 24,
////      height: 24,
////      justifyContent: 'center',
////      alignItems: 'center',
////    },
////    ttsErrorText: {
////      fontSize: scaledSizes.small * 0.85,
////      color: COLORS.primary, // Using primary for error since maroon was undefined in global COLORS
////      textAlign: 'center',
////      marginBottom: 8,
////      fontWeight: '600',
////    },
////
////    // ── Unified Audio Styles ──
////    audioContainer: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.04)',
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      padding: SPACING.small,
////      marginBottom: SPACING.medium,
////    },
////
////    footerDecor: {
////      textAlign: 'center',
////      fontSize: 14,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      letterSpacing: 6,
////      marginTop: 4,
////    },
////
////    // ── Navigation Footer ──
////    footer: {
////      position: 'absolute',
////      bottom: 0,
////      left: 0,
////      right: 0,
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'space-between',
////      paddingHorizontal: SPACING.medium,
////      paddingVertical: SPACING.medium,
////      paddingBottom: SPACING.large,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderTopWidth: 1,
////      borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: -2 },
////      shadowOpacity: 0.06,
////      shadowRadius: 6,
////      elevation: 8,
////    },
////    navBtn: {
////      width: 44,
////      height: 44,
////      borderRadius: 22,
////      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      justifyContent: 'center',
////      alignItems: 'center',
////    },
////    navBtnDisabled: {
////      opacity: 0.3,
////    },
////    saveBtn: {
////      flex: 1,
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'center',
////      backgroundColor: COLORS.primary,
////      height: 48,
////      borderRadius: 50,
////      marginHorizontal: SPACING.medium,
////      gap: SPACING.small,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 3 },
////      shadowOpacity: 0.35,
////      shadowRadius: 8,
////      elevation: 5,
////    },
////    saveBtnActive: {
////      backgroundColor: isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00'),
////    },
////    saveBtnText: {
////      color: '#FFF',
////      fontWeight: '700',
////      fontSize: scaledSizes.base,
////      letterSpacing: 0.3,
////    },
////  });
////
////export default SlokaDetailScreen;
////
//
//
////import React, { useState, useEffect, useRef } from 'react';
////import {
////  View,
////  Text,
////  StyleSheet,
////  ScrollView,
////  TouchableOpacity,
////  Dimensions,
////  Animated,
////  StatusBar,
////} from 'react-native';
////import Icon from 'react-native-vector-icons/MaterialIcons';
////import {
////  fetchSloka,
////  fetchChapterByNumber,
////} from '../services/supabaseService';
////import { getUserId, saveLastRead } from '../services/storageService';
////import { getChapterName, getSlokaText, getMeaning } from '../services/contentService';
////import { generateMeaningAudio } from '../services/ttsService';
////import AudioPlayer from '../components/AudioPlayer';
////import { SPACING, RADIUS, COLORS } from '../constants/colors';
////import { useFontSize } from '../context/FontSizeContext';
////import { useTranslation } from '../hooks/useTranslation';
////import { useLanguage } from '../context/LanguageContext';
////import { useBookmarks } from '../context/BookmarkContext';
////import { useTheme } from '../context/ThemeContext';
////
////const { width } = Dimensions.get('window');
////
////// ─── Lotus Divider ────────────────────────────────────────────────────────
////const LotusLine = ({ color, goldColor }) => (
////  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
////    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
////    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
////    <Text style={{ color: goldColor, fontSize: 18, marginHorizontal: 2 }}>🪷</Text>
////    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
////    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
////  </View>
////);
////
////// ─── Main Screen ──────────────────────────────────────────────────────────
////const SlokaDetailScreen = ({ route, navigation }) => {
////  const { chapterNumber, slokaNumber } = route?.params || {};
////  const { isDark } = useTheme();
////
////  const [sloka, setSloka] = useState(null);
////  const [chapter, setChapter] = useState(null);
////  const [loading, setLoading] = useState(true);
////  const [userId, setUserId] = useState(null);
////  const [error, setError] = useState(null);
////  const [ttsLoading, setTtsLoading] = useState(false);
////  const [ttsError, setTtsError] = useState(null);
////  const [meaningAudioUrl, setMeaningAudioUrl] = useState(null);
////  const isMounted = useRef(true);
////
////  const { scaledSizes } = useFontSize();
////  const t = useTranslation();
////  const { language } = useLanguage();
////  const { isSlokaBookmarked, toggleBookmark: toggleGlobalBookmark } = useBookmarks();
////
////  const isFavorite = sloka ? isSlokaBookmarked(sloka.id) : false;
////
////  // Hoisted cleanup functions
////  function stopMeaningAudio() {
////    if (isMounted.current) {
////      setMeaningAudioUrl(null);
////    }
////  }
////
////  function stopSlokaAudio() {
////    // Recitation AudioPlayer is tied to sloka.audio_url
////  }
////
////  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);
////
////  // Content fade-in
////  const contentAnim = useRef(new Animated.Value(0)).current;
////  const contentSlide = useRef(new Animated.Value(20)).current;
////
////  // Pulse for loading Om
////  const pulseAnim = useRef(new Animated.Value(1)).current;
////
////  // Bookmark bounce
////  const bookmarkAnim = useRef(new Animated.Value(1)).current;
////
////  const pulseAnimRef = useRef(null);
////  useEffect(() => {
////    const anim = Animated.loop(
////      Animated.sequence([
////        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
////        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
////      ])
////    );
////    pulseAnimRef.current = anim;
////    anim.start();
////    return () => {
////      if (pulseAnimRef.current) {
////        pulseAnimRef.current.stop();
////        pulseAnimRef.current = null;
////      }
////      stopMeaningAudio();
////      stopSlokaAudio();
////    };
////  }, [pulseAnim]);
////
////  useEffect(() => {
////    initUser();
////  }, []);
////
////  useEffect(() => {
////    isMounted.current = true;
////    if (chapterNumber && slokaNumber) {
////      loadData();
////    } else {
////      setError('Invalid verse parameters');
////      setLoading(false);
////    }
////    return () => {
////      isMounted.current = false;
////      stopMeaningAudio();
////      stopSlokaAudio();
////    };
////  }, [chapterNumber, slokaNumber, language]);
////
////  const animateContentIn = () => {
////    Animated.parallel([
////      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
////      Animated.timing(contentSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
////    ]).start();
////  };
////
////  const initUser = async () => {
////    try {
////      const id = await getUserId();
////      if (isMounted.current) setUserId(id);
////    } catch (e) {}
////  };
////
////  const loadData = async () => {
////    try {
////      if (!isMounted.current) return;
////      setLoading(true);
////      setError(null);
////      stopMeaningAudio();
////
////      const [slokaData, chapterData] = await Promise.all([
////        fetchSloka(chapterNumber, slokaNumber, language),
////        fetchChapterByNumber(chapterNumber),
////      ]);
////
////      if (!isMounted.current) return;
////
////      if (slokaData && chapterData) {
////        setSloka(slokaData);
////        setChapter(chapterData);
////        saveLastRead(chapterNumber, slokaNumber).catch(() => {});
////        animateContentIn();
////      } else {
////        setError(t('verse.verseNotFound'));
////      }
////    } catch (err) {
////      if (isMounted.current) setError('Failed to load content');
////    } finally {
////      if (isMounted.current) setLoading(false);
////    }
////  };
////
////  const handleToggleBookmark = () => {
////    if (!sloka) return;
////    // Bounce animation
////    Animated.sequence([
////      Animated.timing(bookmarkAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
////      Animated.timing(bookmarkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
////    ]).start();
////
////    toggleGlobalBookmark(sloka);
////  };
////
////  const handleGenerateMeaningAudio = async () => {
////    if (ttsLoading || !sloka) return;
////
////    setTtsLoading(true);
////    setTtsError(null);
////
////    try {
////      const localizedMeaning = getMeaning(sloka, sloka.translation, language);
////      const url = await generateMeaningAudio(localizedMeaning, language);
////      setMeaningAudioUrl(url);
////    } catch (err) {
////      setTtsError(t('common.error') || 'Audio generation failed');
////      setTimeout(() => setTtsError(null), 3000);
////    } finally {
////      setTtsLoading(false);
////    }
////  };
////
////  const handleGoBack = () => {
////    stopMeaningAudio();
////    if (navigation.canGoBack()) {
////      navigation.goBack();
////    } else {
////      navigation.navigate('ChaptersTab', { screen: 'ChaptersList' });
////    }
////  };
////
////  // ── Sloka Navigation (Prev / Next) ─────────────────────────────────────
////  // NOTE: adjust the key below to whatever field your `chapter` row actually
////  // uses for the verse count (e.g. total_slokas, totalSlokas, sloka_count).
////  const totalSlokasInChapter =
////    chapter?.total_slokas || chapter?.totalSlokas || chapter?.sloka_count || null;
////
////  const isFirstSloka = slokaNumber <= 1;
////  const isLastSloka = totalSlokasInChapter ? slokaNumber >= totalSlokasInChapter : false;
////
////  const handlePrevSloka = () => {
////    if (isFirstSloka) return;
////    stopMeaningAudio();
////    navigation.push('SlokaDetail', {
////      chapterNumber,
////      slokaNumber: slokaNumber - 1,
////    });
////  };
////
////  const handleNextSloka = () => {
////    if (isLastSloka) return;
////    stopMeaningAudio();
////    navigation.push('SlokaDetail', {
////      chapterNumber,
////      slokaNumber: slokaNumber + 1,
////    });
////  };
////
////  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
////  const saffron = isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00');
////  const headerBg = isDark ? (COLORS.darkSurface || '#2C2C2C') : (COLORS.primary || '#FF8C00');
////
////  // ── Loading State ─────────────────────────────────────────────────────
////  if (loading) {
////    return (
////      <View style={[styles.container, styles.centerContent]}>
////        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
////          ॐ
////        </Animated.Text>
////        <Text style={styles.loadingText}>{t('common.loading')}</Text>
////      </View>
////    );
////  }
////
////  // ── Error State ───────────────────────────────────────────────────────
////  if (error || !sloka || !chapter) {
////    return (
////      <View style={[styles.container, styles.centerContent]}>
////        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////        <Text style={[styles.omLoader, { color: gold }]}>ॐ</Text>
////        <Text style={styles.errorText}>{error || t('common.error')}</Text>
////        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack} activeOpacity={0.8}>
////          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
////        </TouchableOpacity>
////      </View>
////    );
////  }
////
////  const localizedChapterName = getChapterName(chapter, language);
////  const localizedSlokaText = getSlokaText(sloka, sloka.translation, language);
////  const localizedMeaning = getMeaning(sloka, sloka.translation, language);
////
////  return (
////    <View style={styles.container}>
////      <StatusBar barStyle="light-content" backgroundColor={headerBg} />
////
////      {/* ── Decorative Header ── */}
////      <View style={[styles.header, { backgroundColor: headerBg }]}>
////        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.8}>
////          <Icon name="arrow-back" size={22} color="#FFF" />
////        </TouchableOpacity>
////
////        <View style={styles.headerCenter}>
////          {/* Om symbol above title */}
////          <Text style={[styles.headerOm, { color: gold }]}>ॐ</Text>
////          <Text style={styles.headerChapterName} numberOfLines={1}>
////            {localizedChapterName}
////          </Text>
////          <Text style={styles.headerVerseNum}>
////            {t('sloka.verse')} {slokaNumber}
////          </Text>
////        </View>
////
////        <TouchableOpacity style={styles.headerBtn} onPress={handleToggleBookmark} activeOpacity={0.8}>
////          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
////            <Icon
////              name={isFavorite ? 'bookmark' : 'bookmark-border'}
////              size={22}
////              color={isFavorite ? gold : '#FFF'}
////            />
////          </Animated.View>
////        </TouchableOpacity>
////      </View>
////
////      {/* ── Content ── */}
////      <Animated.ScrollView
////        style={styles.scroll}
////        contentContainerStyle={styles.scrollContent}
////        showsVerticalScrollIndicator={false}>
////
////        {/* Verse Card */}
////        <Animated.View
////          style={[
////            styles.verseCard,
////            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
////          ]}>
////          {/* Gold top strip */}
////          <View style={[styles.verseStrip, { backgroundColor: gold }]} />
////          <View style={styles.verseCardInner}>
////            <View style={styles.verseRefRow}>
////              <View style={styles.verseChip}>
////                <Text style={[styles.verseChipText, { color: gold }]}>
////                  {t('chapters.chapter')} {chapterNumber}  ·  {t('sloka.verse')} {slokaNumber}
////                </Text>
////              </View>
////            </View>
////            <Text style={styles.verseText}>{localizedSlokaText}</Text>
////          </View>
////        </Animated.View>
////
////        {/* Audio Player */}
////        {sloka.audio_url && (
////          <Animated.View
////            style={[
////              styles.audioCard,
////              { opacity: contentAnim },
////            ]}>
////            <View style={styles.audioLabel}>
////              <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
////              <Text style={[styles.audioLabelText, { color: saffron }]}>{t('sloka.playAudio') || 'Recitation'}</Text>
////            </View>
////            <AudioPlayer
////              audioUrl={sloka.audio_url}
////              duration={sloka.audio_duration}
////              chapterNumber={chapterNumber}
////              verseNumber={slokaNumber}
////              isDark={isDark}
////            />
////          </Animated.View>
////        )}
////
////        {/* Translation / Meaning */}
////        <Animated.View
////          style={[
////            styles.meaningCard,
////            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
////          ]}>
////          <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} goldColor={gold} />
////
////          <View style={styles.meaningHeader}>
////            <Text style={[styles.meaningLabel, { color: gold }]}>
////              {t('sloka.translation').toUpperCase()}/
////            </Text>
////          </View>
////
////          {meaningAudioUrl ? (
////            <View style={styles.audioContainer}>
////              <View style={styles.audioLabel}>
////                <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
////                <Text style={[styles.audioLabelText, { color: saffron }]}>GURU VOICE</Text>
////              </View>
////              <AudioPlayer
////                audioUrl={meaningAudioUrl}
////                duration={0}
////                chapterNumber={chapterNumber}
////                verseNumber={slokaNumber}
////              />
////            </View>
////          ) : (
////            <TouchableOpacity
////              style={[styles.ttsBtn, ttsLoading && styles.ttsBtnDisabled]}
////              onPress={handleGenerateMeaningAudio}
////              disabled={ttsLoading}
////              activeOpacity={0.7}
////            >
////              {ttsLoading ? (
////                <View style={styles.loaderContainer}>
////                   <Icon name="sync" size={18} color={gold} />
////                </View>
////              ) : (
////                <Icon name="play-circle-outline" size={24} color={gold} />
////              )}
////              <Text style={[styles.ttsBtnText, { color: gold }]}>
////                {ttsLoading ? (t('common.loading') || 'GENERATING...') : 'LISTEN MEANING'}
////              </Text>
////            </TouchableOpacity>
////          )}
////
////          {ttsError && (
////            <Text style={styles.ttsErrorText}>{ttsError}</Text>
////          )}
////
////          <Text style={styles.meaningText}>{localizedMeaning}</Text>
////        </Animated.View>
////
////      </Animated.ScrollView>
////
////      {/* ── Navigation Footer ── */}
////      <View style={styles.footer}>
////        {/* Prev */}
////        <TouchableOpacity
////          style={[styles.navBtn, isFirstSloka && styles.navBtnDisabled]}
////          disabled={isFirstSloka}
////          onPress={handlePrevSloka}
////          activeOpacity={0.8}>
////          <Icon
////            name="chevron-left"
////            size={22}
////            color={isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
////          />
////          <Text
////            style={[
////              styles.navBtnLabel,
////              { color: isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
////            ]}
////            numberOfLines={1}>
////            {t('Previous') || 'Previous'}
////          </Text>
////        </TouchableOpacity>
////
////        {/* Save Button */}
////        <TouchableOpacity
////          style={[styles.saveBtn, isFavorite && styles.saveBtnActive]}
////          onPress={handleToggleBookmark}
////          activeOpacity={0.85}>
////          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
////            <Icon
////              name={isFavorite ? 'bookmark' : 'bookmark-border'}
////              size={20}
////              color="#FFF"
////            />
////          </Animated.View>
////          <Text style={styles.saveBtnText}>
////            {isFavorite ? 'Saved Sloka' : 'Save Sloka'}
////          </Text>
////        </TouchableOpacity>
////
////        {/* Next */}
////        <TouchableOpacity
////          style={[styles.navBtn, isLastSloka && styles.navBtnDisabled]}
////          disabled={isLastSloka}
////          onPress={handleNextSloka}
////          activeOpacity={0.8}>
////          <Text
////            style={[
////              styles.navBtnLabel,
////              { color: isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
////            ]}
////            numberOfLines={1}>
////            {t('Next') || 'Next'}
////          </Text>
////          <Icon
////            name="chevron-right"
////            size={22}
////            color={isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
////          />
////        </TouchableOpacity>
////      </View>
////    </View>
////  );
////};
////
////// ─── Styles ───────────────────────────────────────────────────────────────
////const getStyles = (isDark, scaledSizes) =>
////  StyleSheet.create({
////    container: {
////      flex: 1,
////      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
////    },
////    centerContent: {
////      flex: 1,
////      justifyContent: 'center',
////      alignItems: 'center',
////      padding: SPACING.large,
////    },
////
////    // ── Loading / Error ──
////    omLoader: {
////      fontSize: 64,
////      textAlign: 'center',
////      marginBottom: SPACING.medium,
////    },
////    loadingText: {
////      fontSize: scaledSizes.base,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      letterSpacing: 1.5,
////      textTransform: 'uppercase',
////      marginTop: SPACING.small,
////    },
////    errorText: {
////      fontSize: scaledSizes.base,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      textAlign: 'center',
////      lineHeight: scaledSizes.base * 1.6,
////      marginVertical: SPACING.large,
////    },
////    retryButton: {
////      backgroundColor: COLORS.primary,
////      paddingHorizontal: SPACING.xlarge,
////      paddingVertical: SPACING.medium,
////      borderRadius: 50,
////    },
////    retryButtonText: {
////      color: '#FFF',
////      fontWeight: '700',
////      fontSize: scaledSizes.base,
////    },
////
////    // ── Header ──
////    header: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      paddingTop: SPACING.xlarge,
////      paddingBottom: SPACING.medium,
////      paddingHorizontal: SPACING.medium,
////      // Bottom gold border accent
////      borderBottomWidth: 2,
////      borderBottomColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 3 },
////      shadowOpacity: 0.3,
////      shadowRadius: 6,
////      elevation: 8,
////    },
////    headerBtn: {
////      width: 40,
////      height: 40,
////      borderRadius: 20,
////      backgroundColor: 'rgba(255,255,255,0.12)',
////      justifyContent: 'center',
////      alignItems: 'center',
////    },
////    headerCenter: {
////      flex: 1,
////      alignItems: 'center',
////      marginHorizontal: SPACING.small,
////    },
////    headerOm: {
////      fontSize: 16,
////      marginBottom: 2,
////    },
////    headerChapterName: {
////      color: '#FFF',
////      fontSize: scaledSizes.base,
////      fontWeight: '700',
////      letterSpacing: 0.3,
////    },
////    headerVerseNum: {
////      color: 'rgba(255,255,255,0.7)',
////      fontSize: scaledSizes.small,
////      marginTop: 2,
////      letterSpacing: 0.5,
////    },
////
////    // ── Scroll ──
////    scroll: { flex: 1 },
////    scrollContent: {
////      padding: SPACING.medium,
////      paddingBottom: 100,
////    },
////
////    // ── Verse Card ──
////    verseCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      overflow: 'hidden',
////      marginBottom: SPACING.medium,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 4 },
////      shadowOpacity: isDark ? 0.2 : 0.12,
////      shadowRadius: 12,
////      elevation: 6,
////    },
////    verseStrip: {
////      height: 3,
////    },
////    verseCardInner: {
////      padding: SPACING.large,
////    },
////    verseRefRow: {
////      alignItems: 'center',
////      marginBottom: SPACING.medium,
////    },
////    verseChip: {
////      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
////      borderRadius: 30,
////      paddingHorizontal: 14,
////      paddingVertical: 5,
////    },
////    verseChipText: {
////      fontSize: scaledSizes.small,
////      fontWeight: '700',
////      letterSpacing: 1,
////      textTransform: 'uppercase',
////    },
////    verseText: {
////      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.15,
////      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.15) * 1.7,
////      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
////      textAlign: 'center',
////      fontStyle: 'italic',
////      fontWeight: '500',
////    },
////
////    // ── Audio Card ──
////    audioCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      overflow: 'hidden',
////      marginBottom: SPACING.medium,
////      padding: SPACING.small,
////    },
////    audioLabel: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      paddingHorizontal: SPACING.small,
////      paddingTop: SPACING.small,
////      paddingBottom: 4,
////    },
////    audioLabelText: {
////      fontSize: scaledSizes.small,
////      fontWeight: '700',
////      letterSpacing: 1,
////      textTransform: 'uppercase',
////    },
////
////    // ── Meaning Card ──
////    meaningCard: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      borderLeftWidth: 3,
////      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
////      padding: SPACING.large,
////      marginBottom: SPACING.medium,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 2 },
////      shadowOpacity: 0.08,
////      shadowRadius: 8,
////      elevation: 3,
////    },
////    meaningHeader: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'space-between',
////      marginBottom: SPACING.medium,
////      width: '100%',
////    },
////    meaningLabel: {
////      fontSize: scaledSizes.small,
////      fontWeight: '800',
////      letterSpacing: 2,
////    },
////    meaningText: {
////      fontSize: scaledSizes.base,
////      lineHeight: scaledSizes.base * 1.75,
////      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
////      textAlign: 'justify',
////    },
////
////    // ── TTS Button ──
////    ttsBtn: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
////      paddingHorizontal: 12,
////      paddingVertical: 6,
////      borderRadius: 20,
////      borderWidth: 1,
////      borderColor: 'rgba(212, 175, 55, 0.3)',
////      marginTop: 8,
////    },
////    ttsBtnDisabled: {
////      opacity: 0.6,
////    },
////    ttsBtnText: {
////      fontSize: scaledSizes.small * 0.9,
////      fontWeight: '700',
////      marginLeft: 6,
////      letterSpacing: 0.5,
////    },
////    loaderContainer: {
////      width: 24,
////      height: 24,
////      justifyContent: 'center',
////      alignItems: 'center',
////    },
////    ttsErrorText: {
////      fontSize: scaledSizes.small * 0.85,
////      color: COLORS.primary, // Using primary for error since maroon was undefined in global COLORS
////      textAlign: 'center',
////      marginBottom: 8,
////      fontWeight: '600',
////    },
////
////    // ── Unified Audio Styles ──
////    audioContainer: {
////      borderRadius: RADIUS.card,
////      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.04)',
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      padding: SPACING.small,
////      marginBottom: SPACING.medium,
////    },
////
////    footerDecor: {
////      textAlign: 'center',
////      fontSize: 14,
////      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
////      letterSpacing: 6,
////      marginTop: 4,
////    },
////
////    // ── Navigation Footer ──
////    footer: {
////      position: 'absolute',
////      bottom: 0,
////      left: 0,
////      right: 0,
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'space-between',
////      paddingHorizontal: SPACING.medium,
////      paddingVertical: SPACING.medium,
////      paddingBottom: SPACING.large,
////      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
////      borderTopWidth: 1,
////      borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: -2 },
////      shadowOpacity: 0.06,
////      shadowRadius: 6,
////      elevation: 8,
////    },
////    navBtn: {
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'center',
////      height: 44,
////      minWidth: 92,
////      paddingHorizontal: 12,
////      borderRadius: 22,
////      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
////      borderWidth: 1,
////      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
////      gap: 4,
////    },
////    navBtnDisabled: {
////      opacity: 0.3,
////    },
////    navBtnLabel: {
////      fontSize: scaledSizes.small * 0.9,
////      fontWeight: '700',
////      letterSpacing: 0.3,
////    },
////    saveBtn: {
////      flex: 1,
////      flexDirection: 'row',
////      alignItems: 'center',
////      justifyContent: 'center',
////      backgroundColor: COLORS.primary,
////      height: 48,
////      borderRadius: 50,
////      marginHorizontal: SPACING.medium,
////      gap: SPACING.small,
////      shadowColor: '#000',
////      shadowOffset: { width: 0, height: 3 },
////      shadowOpacity: 0.35,
////      shadowRadius: 8,
////      elevation: 5,
////    },
////    saveBtnActive: {
////      backgroundColor: isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00'),
////    },
////    saveBtnText: {
////      color: '#FFF',
////      fontWeight: '700',
////      fontSize: scaledSizes.base,
////      letterSpacing: 0.3,
////    },
////  });
////
////export default SlokaDetailScreen;
//
//import React, { useState, useEffect, useRef } from 'react';
//import {
//  View,
//  Text,
//  StyleSheet,
//  ScrollView,
//  TouchableOpacity,
//  Dimensions,
//  Animated,
//  StatusBar,
//} from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons';
//import {
//  fetchSloka,
//  fetchChapterByNumber,
//} from '../services/supabaseService';
//import { getUserId, saveLastRead } from '../services/storageService';
//import { getChapterName, getSlokaText, getMeaning } from '../services/contentService';
//import { generateMeaningAudio } from '../services/ttsService';
//import {
//  saveSlokaOffline,
//  removeSlokaOffline,
//  getOfflineSloka,
//} from '../services/offlineService';
//import AudioPlayer from '../components/AudioPlayer';
//import { SPACING, RADIUS, COLORS } from '../constants/colors';
//import { useFontSize } from '../context/FontSizeContext';
//import { useTranslation } from '../hooks/useTranslation';
//import { useLanguage } from '../context/LanguageContext';
//import { useBookmarks } from '../context/BookmarkContext';
//import { useTheme } from '../context/ThemeContext';
//
//const { width } = Dimensions.get('window');
//
//// ─── Lotus Divider ────────────────────────────────────────────────────────
//const LotusLine = ({ color, goldColor }) => (
//  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
//    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
//    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
//    <Text style={{ color: goldColor, fontSize: 18, marginHorizontal: 2 }}>🪷</Text>
//    <Text style={{ color: goldColor, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
//    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
//  </View>
//);
//
//// ─── Main Screen ──────────────────────────────────────────────────────────
//const SlokaDetailScreen = ({ route, navigation }) => {
//  const { chapterNumber, slokaNumber } = route?.params || {};
//  const { isDark } = useTheme();
//
//  const [sloka, setSloka] = useState(null);
//  const [chapter, setChapter] = useState(null);
//  const [loading, setLoading] = useState(true);
//  const [userId, setUserId] = useState(null);
//  const [error, setError] = useState(null);
//  const [ttsLoading, setTtsLoading] = useState(false);
//  const [ttsError, setTtsError] = useState(null);
//  const [meaningAudioUrl, setMeaningAudioUrl] = useState(null);
//
//  // Offline state
//  const [offlineRecord, setOfflineRecord] = useState(null);
//  const [downloadState, setDownloadState] = useState('idle'); // idle | downloading | downloaded
//  const [downloadProgress, setDownloadProgress] = useState({ recitation: 0, meaning: 0 });
//  const [usingOfflineData, setUsingOfflineData] = useState(false);
//
//  const isMounted = useRef(true);
//
//  const { scaledSizes } = useFontSize();
//  const t = useTranslation();
//  const { language } = useLanguage();
//  const { isSlokaBookmarked, toggleBookmark: toggleGlobalBookmark } = useBookmarks();
//
//  const isFavorite = sloka ? isSlokaBookmarked(sloka.id) : false;
//
//  // Hoisted cleanup functions
//  function stopMeaningAudio() {
//    if (isMounted.current) {
//      setMeaningAudioUrl(null);
//    }
//  }
//
//  function stopSlokaAudio() {
//    // Recitation AudioPlayer is tied to sloka.audio_url
//  }
//
//  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);
//
//  // Content fade-in
//  const contentAnim = useRef(new Animated.Value(0)).current;
//  const contentSlide = useRef(new Animated.Value(20)).current;
//
//  // Pulse for loading Om
//  const pulseAnim = useRef(new Animated.Value(1)).current;
//
//  // Bookmark bounce
//  const bookmarkAnim = useRef(new Animated.Value(1)).current;
//
//  const pulseAnimRef = useRef(null);
//  useEffect(() => {
//    const anim = Animated.loop(
//      Animated.sequence([
//        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
//        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
//      ])
//    );
//    pulseAnimRef.current = anim;
//    anim.start();
//    return () => {
//      if (pulseAnimRef.current) {
//        pulseAnimRef.current.stop();
//        pulseAnimRef.current = null;
//      }
//      stopMeaningAudio();
//      stopSlokaAudio();
//    };
//  }, [pulseAnim]);
//
//  useEffect(() => {
//    initUser();
//  }, []);
//
//  useEffect(() => {
//    isMounted.current = true;
//    if (chapterNumber && slokaNumber) {
//      loadData();
//    } else {
//      setError('Invalid verse parameters');
//      setLoading(false);
//    }
//    return () => {
//      isMounted.current = false;
//      stopMeaningAudio();
//      stopSlokaAudio();
//    };
//  }, [chapterNumber, slokaNumber, language]);
//
//  // Check offline cache status whenever the verse changes
//  useEffect(() => {
//    let active = true;
//    if (chapterNumber && slokaNumber) {
//      getOfflineSloka(chapterNumber, slokaNumber).then((rec) => {
//        if (active) {
//          setOfflineRecord(rec);
//          setDownloadState(rec ? 'downloaded' : 'idle');
//        }
//      });
//    }
//    return () => {
//      active = false;
//    };
//  }, [chapterNumber, slokaNumber]);
//
//  const animateContentIn = () => {
//    Animated.parallel([
//      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
//      Animated.timing(contentSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
//    ]).start();
//  };
//
//  const initUser = async () => {
//    try {
//      const id = await getUserId();
//      if (isMounted.current) setUserId(id);
//    } catch (e) {}
//  };
//
//  const loadData = async () => {
//    try {
//      if (!isMounted.current) return;
//      setLoading(true);
//      setError(null);
//      setUsingOfflineData(false);
//      stopMeaningAudio();
//
//      const [slokaData, chapterData] = await Promise.all([
//        fetchSloka(chapterNumber, slokaNumber, language),
//        fetchChapterByNumber(chapterNumber),
//      ]);
//
//      if (!isMounted.current) return;
//
//      if (slokaData && chapterData) {
//        setSloka(slokaData);
//        setChapter(chapterData);
//        saveLastRead(chapterNumber, slokaNumber).catch(() => {});
//        animateContentIn();
//      } else {
//        setError(t('verse.verseNotFound'));
//      }
//    } catch (err) {
//      // Network/DB call failed — fall back to the offline copy if we have one
//      const cached = await getOfflineSloka(chapterNumber, slokaNumber);
//      if (isMounted.current && cached) {
//        setSloka(cached.sloka);
//        setChapter(cached.chapter);
//        setOfflineRecord(cached);
//        setDownloadState('downloaded');
//        setUsingOfflineData(true);
//        animateContentIn();
//      } else if (isMounted.current) {
//        setError('Failed to load content');
//      }
//    } finally {
//      if (isMounted.current) setLoading(false);
//    }
//  };
//
//  const handleToggleBookmark = () => {
//    if (!sloka) return;
//    // Bounce animation
//    Animated.sequence([
//      Animated.timing(bookmarkAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
//      Animated.timing(bookmarkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
//    ]).start();
//
//    toggleGlobalBookmark(sloka);
//  };
//
//  const handleGenerateMeaningAudio = async () => {
//    if (ttsLoading || !sloka) return;
//
//    setTtsLoading(true);
//    setTtsError(null);
//
//    try {
//      const localizedMeaning = getMeaning(sloka, sloka.translation, language);
//      const url = await generateMeaningAudio(localizedMeaning, language);
//      setMeaningAudioUrl(url);
//    } catch (err) {
//      setTtsError(t('common.error') || 'Audio generation failed');
//      setTimeout(() => setTtsError(null), 3000);
//    } finally {
//      setTtsLoading(false);
//    }
//  };
//
//  const handleGoBack = () => {
//    stopMeaningAudio();
//    if (navigation.canGoBack()) {
//      navigation.goBack();
//    } else {
//      navigation.navigate('ChaptersTab', { screen: 'ChaptersList' });
//    }
//  };
//
//  // ── Sloka Navigation (Prev / Next) ─────────────────────────────────────
//  // NOTE: adjust the key below to whatever field your `chapter` row actually
//  // uses for the verse count (e.g. total_slokas, totalSlokas, sloka_count).
//  const totalSlokasInChapter =
//    chapter?.total_slokas || chapter?.totalSlokas || chapter?.sloka_count || null;
//
//  const isFirstSloka = slokaNumber <= 1;
//  const isLastSloka = totalSlokasInChapter ? slokaNumber >= totalSlokasInChapter : false;
//
//  const handlePrevSloka = () => {
//    if (isFirstSloka) return;
//    stopMeaningAudio();
//    navigation.push('SlokaDetail', {
//      chapterNumber,
//      slokaNumber: slokaNumber - 1,
//    });
//  };
//
//  const handleNextSloka = () => {
//    if (isLastSloka) return;
//    stopMeaningAudio();
//    navigation.push('SlokaDetail', {
//      chapterNumber,
//      slokaNumber: slokaNumber + 1,
//    });
//  };
//
//  // ── Offline Download ────────────────────────────────────────────────────
//  const handleDownloadOffline = async () => {
//    if (!sloka || !chapter || downloadState === 'downloading') return;
//    setDownloadState('downloading');
//    setDownloadProgress({ recitation: 0, meaning: 0 });
//    try {
//      const record = await saveSlokaOffline(sloka, chapter, chapterNumber, slokaNumber, {
//        recitationAudioUrl: sloka.audio_url,
//        meaningAudioUrl: meaningAudioUrl, // caches it only if already generated this session
//        onProgress: (type, pct) => {
//          setDownloadProgress((prev) => ({ ...prev, [type]: pct }));
//        },
//      });
//      if (isMounted.current) {
//        if (record) {
//          setOfflineRecord(record);
//          setDownloadState('downloaded');
//        } else {
//          setDownloadState('idle');
//        }
//      }
//    } catch (e) {
//      if (isMounted.current) setDownloadState('idle');
//    }
//  };
//
//  const handleRemoveOffline = async () => {
//    await removeSlokaOffline(chapterNumber, slokaNumber);
//    if (isMounted.current) {
//      setOfflineRecord(null);
//      setDownloadState('idle');
//    }
//  };
//
//  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
//  const saffron = isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00');
//  const headerBg = isDark ? (COLORS.darkSurface || '#2C2C2C') : (COLORS.primary || '#FF8C00');
//
//  // ── Loading State ─────────────────────────────────────────────────────
//  if (loading) {
//    return (
//      <View style={[styles.container, styles.centerContent]}>
//        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
//        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
//          ॐ
//        </Animated.Text>
//        <Text style={styles.loadingText}>{t('common.loading')}</Text>
//      </View>
//    );
//  }
//
//  // ── Error State ───────────────────────────────────────────────────────
//  if (error || !sloka || !chapter) {
//    return (
//      <View style={[styles.container, styles.centerContent]}>
//        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
//        <Text style={[styles.omLoader, { color: gold }]}>ॐ</Text>
//        <Text style={styles.errorText}>{error || t('common.error')}</Text>
//        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack} activeOpacity={0.8}>
//          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
//        </TouchableOpacity>
//      </View>
//    );
//  }
//
//  const localizedChapterName = getChapterName(chapter, language);
//  const localizedSlokaText = getSlokaText(sloka, sloka.translation, language);
//  const localizedMeaning = getMeaning(sloka, sloka.translation, language);
//  const effectiveMeaningAudioUrl = meaningAudioUrl || offlineRecord?.meaningAudioPath || null;
//
//  return (
//    <View style={styles.container}>
//      <StatusBar barStyle="light-content" backgroundColor={headerBg} />
//
//      {/* ── Decorative Header ── */}
//      <View style={[styles.header, { backgroundColor: headerBg }]}>
//        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.8}>
//          <Icon name="arrow-back" size={22} color="#FFF" />
//        </TouchableOpacity>
//
//        <View style={styles.headerCenter}>
//          {/* Om symbol above title */}
//          <Text style={[styles.headerOm, { color: gold }]}>ॐ</Text>
//          <Text style={styles.headerChapterName} numberOfLines={1}>
//            {localizedChapterName}
//          </Text>
//          <Text style={styles.headerVerseNum}>
//            {t('sloka.verse')} {slokaNumber}
//          </Text>
//        </View>
//
//        <View style={styles.headerRightGroup}>
//          <TouchableOpacity
//            style={styles.headerBtn}
//            onPress={handleToggleBookmark}
//            activeOpacity={0.8}>
//            <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
//              <Icon
//                name={isFavorite ? 'bookmark' : 'bookmark-border'}
//                size={22}
//                color={isFavorite ? gold : '#FFF'}
//              />
//            </Animated.View>
//          </TouchableOpacity>
//        </View>
//      </View>
//
//      {/* ── Content ── */}
//      <Animated.ScrollView
//        style={styles.scroll}
//        contentContainerStyle={styles.scrollContent}
//        showsVerticalScrollIndicator={false}>
//
//        {/* Offline banner */}
//        {usingOfflineData && (
//          <View style={styles.offlineBanner}>
//            <Icon name="offline-pin" size={14} color={gold} />
//            <Text style={[styles.offlineBannerText, { color: gold }]}>
//              Showing saved offline copy
//            </Text>
//          </View>
//        )}
//
//        {/* Verse Card */}
//        <Animated.View
//          style={[
//            styles.verseCard,
//            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
//          ]}>
//          {/* Gold top strip */}
//          <View style={[styles.verseStrip, { backgroundColor: gold }]} />
//          <View style={styles.verseCardInner}>
//            <View style={styles.verseRefRow}>
//              <View style={styles.verseChip}>
//                <Text style={[styles.verseChipText, { color: gold }]}>
//                  {t('chapters.chapter')} {chapterNumber}  ·  {t('sloka.verse')} {slokaNumber}
//                </Text>
//              </View>
//            </View>
//            <Text style={styles.verseText}>{localizedSlokaText}</Text>
//          </View>
//        </Animated.View>
//
//        {/* Download for Offline */}
//        <Animated.View style={[styles.downloadCard, { opacity: contentAnim }]}>
//          {downloadState === 'downloaded' ? (
//            <TouchableOpacity style={styles.downloadedRow} onPress={handleRemoveOffline} activeOpacity={0.7}>
//              <Icon name="offline-pin" size={20} color={gold} />
//              <Text style={[styles.downloadedText, { color: gold }]}>Saved for offline</Text>
//              <Icon name="delete-outline" size={18} color={saffron} />
//            </TouchableOpacity>
//          ) : downloadState === 'downloading' ? (
//            <View style={styles.downloadedRow}>
//              <Icon name="sync" size={20} color={gold} />
//              <Text style={[styles.downloadedText, { color: gold }]}>
//                Downloading{sloka.audio_url ? ` ${downloadProgress.recitation}%` : '...'}
//              </Text>
//            </View>
//          ) : (
//            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadOffline} activeOpacity={0.8}>
//              <Icon name="file-download" size={20} color="#FFF" />
//              <Text style={styles.downloadBtnText}>Download for Offline</Text>
//            </TouchableOpacity>
//          )}
//        </Animated.View>
//
//        {/* Audio Player */}
//        {(sloka.audio_url || offlineRecord?.recitationAudioPath) && (
//          <Animated.View
//            style={[
//              styles.audioCard,
//              { opacity: contentAnim },
//            ]}>
//            <View style={styles.audioLabel}>
//              <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
//              <Text style={[styles.audioLabelText, { color: saffron }]}>{t('sloka.playAudio') || 'Recitation'}</Text>
//            </View>
//            <AudioPlayer
//              audioUrl={offlineRecord?.recitationAudioPath || sloka.audio_url}
//              duration={sloka.audio_duration}
//              chapterNumber={chapterNumber}
//              verseNumber={slokaNumber}
//              isDark={isDark}
//            />
//          </Animated.View>
//        )}
//
//        {/* Translation / Meaning */}
//        <Animated.View
//          style={[
//            styles.meaningCard,
//            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
//          ]}>
//          <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} goldColor={gold} />
//
//          <View style={styles.meaningHeader}>
//            <Text style={[styles.meaningLabel, { color: gold }]}>
//              {t('sloka.translation').toUpperCase()}/
//            </Text>
//          </View>
//
//          {effectiveMeaningAudioUrl ? (
//            <View style={styles.audioContainer}>
//              <View style={styles.audioLabel}>
//                <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
//                <Text style={[styles.audioLabelText, { color: saffron }]}>GURU VOICE</Text>
//              </View>
//              <AudioPlayer
//                audioUrl={effectiveMeaningAudioUrl}
//                duration={0}
//                chapterNumber={chapterNumber}
//                verseNumber={slokaNumber}
//              />
//            </View>
//          ) : (
//            <TouchableOpacity
//              style={[styles.ttsBtn, ttsLoading && styles.ttsBtnDisabled]}
//              onPress={handleGenerateMeaningAudio}
//              disabled={ttsLoading}
//              activeOpacity={0.7}
//            >
//              {ttsLoading ? (
//                <View style={styles.loaderContainer}>
//                   <Icon name="sync" size={18} color={gold} />
//                </View>
//              ) : (
//                <Icon name="play-circle-outline" size={24} color={gold} />
//              )}
//              <Text style={[styles.ttsBtnText, { color: gold }]}>
//                {ttsLoading ? (t('common.loading') || 'GENERATING...') : 'LISTEN MEANING'}
//              </Text>
//            </TouchableOpacity>
//          )}
//
//          {ttsError && (
//            <Text style={styles.ttsErrorText}>{ttsError}</Text>
//          )}
//
//          <Text style={styles.meaningText}>{localizedMeaning}</Text>
//        </Animated.View>
//
//      </Animated.ScrollView>
//
//      {/* ── Navigation Footer ── */}
//      <View style={styles.footer}>
//        {/* Prev */}
//        <TouchableOpacity
//          style={[styles.navBtn, isFirstSloka && styles.navBtnDisabled]}
//          disabled={isFirstSloka}
//          onPress={handlePrevSloka}
//          activeOpacity={0.8}>
//          <Icon
//            name="chevron-left"
//            size={22}
//            color={isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
//          />
//          <Text
//            style={[
//              styles.navBtnLabel,
//              { color: isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
//            ]}
//            numberOfLines={1}>
//            {t('Previous') || 'Previous'}
//          </Text>
//        </TouchableOpacity>
//
//        {/* Save Button */}
//        <TouchableOpacity
//          style={[styles.saveBtn, isFavorite && styles.saveBtnActive]}
//          onPress={handleToggleBookmark}
//          activeOpacity={0.85}>
//          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
//            <Icon
//              name={isFavorite ? 'bookmark' : 'bookmark-border'}
//              size={20}
//              color="#FFF"
//            />
//          </Animated.View>
//          <Text style={styles.saveBtnText}>
//            {isFavorite ? 'Saved Sloka' : 'Save Sloka'}
//          </Text>
//        </TouchableOpacity>
//
//        {/* Next */}
//        <TouchableOpacity
//          style={[styles.navBtn, isLastSloka && styles.navBtnDisabled]}
//          disabled={isLastSloka}
//          onPress={handleNextSloka}
//          activeOpacity={0.8}>
//          <Text
//            style={[
//              styles.navBtnLabel,
//              { color: isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
//            ]}
//            numberOfLines={1}>
//            {t('Next') || 'Next'}
//          </Text>
//          <Icon
//            name="chevron-right"
//            size={22}
//            color={isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
//          />
//        </TouchableOpacity>
//      </View>
//    </View>
//  );
//};
//
//// ─── Styles ───────────────────────────────────────────────────────────────
//const getStyles = (isDark, scaledSizes) =>
//  StyleSheet.create({
//    container: {
//      flex: 1,
//      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
//    },
//    centerContent: {
//      flex: 1,
//      justifyContent: 'center',
//      alignItems: 'center',
//      padding: SPACING.large,
//    },
//
//    // ── Loading / Error ──
//    omLoader: {
//      fontSize: 64,
//      textAlign: 'center',
//      marginBottom: SPACING.medium,
//    },
//    loadingText: {
//      fontSize: scaledSizes.base,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 1.5,
//      textTransform: 'uppercase',
//      marginTop: SPACING.small,
//    },
//    errorText: {
//      fontSize: scaledSizes.base,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      textAlign: 'center',
//      lineHeight: scaledSizes.base * 1.6,
//      marginVertical: SPACING.large,
//    },
//    retryButton: {
//      backgroundColor: COLORS.primary,
//      paddingHorizontal: SPACING.xlarge,
//      paddingVertical: SPACING.medium,
//      borderRadius: 50,
//    },
//    retryButtonText: {
//      color: '#FFF',
//      fontWeight: '700',
//      fontSize: scaledSizes.base,
//    },
//
//    // ── Header ──
//    header: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      paddingTop: SPACING.xlarge,
//      paddingBottom: SPACING.medium,
//      paddingHorizontal: SPACING.medium,
//      // Bottom gold border accent
//      borderBottomWidth: 2,
//      borderBottomColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 3 },
//      shadowOpacity: 0.3,
//      shadowRadius: 6,
//      elevation: 8,
//    },
//    headerBtn: {
//      width: 40,
//      height: 40,
//      borderRadius: 20,
//      backgroundColor: 'rgba(255,255,255,0.12)',
//      justifyContent: 'center',
//      alignItems: 'center',
//    },
//    headerRightGroup: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      gap: 8,
//    },
//    headerCenter: {
//      flex: 1,
//      alignItems: 'center',
//      marginHorizontal: SPACING.small,
//    },
//    headerOm: {
//      fontSize: 16,
//      marginBottom: 2,
//    },
//    headerChapterName: {
//      color: '#FFF',
//      fontSize: scaledSizes.base,
//      fontWeight: '700',
//      letterSpacing: 0.3,
//    },
//    headerVerseNum: {
//      color: 'rgba(255,255,255,0.7)',
//      fontSize: scaledSizes.small,
//      marginTop: 2,
//      letterSpacing: 0.5,
//    },
//
//    // ── Scroll ──
//    scroll: { flex: 1 },
//    scrollContent: {
//      padding: SPACING.medium,
//      paddingBottom: 100,
//    },
//
//    // ── Offline Banner ──
//    offlineBanner: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      alignSelf: 'center',
//      paddingHorizontal: 10,
//      paddingVertical: 4,
//      borderRadius: 20,
//      backgroundColor: 'rgba(212, 175, 55, 0.12)',
//      marginBottom: SPACING.small,
//      gap: 4,
//    },
//    offlineBannerText: {
//      fontSize: 11,
//      fontWeight: '700',
//      letterSpacing: 0.3,
//    },
//
//    // ── Verse Card ──
//    verseCard: {
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      overflow: 'hidden',
//      marginBottom: SPACING.medium,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 4 },
//      shadowOpacity: isDark ? 0.2 : 0.12,
//      shadowRadius: 12,
//      elevation: 6,
//    },
//    verseStrip: {
//      height: 3,
//    },
//    verseCardInner: {
//      padding: SPACING.large,
//    },
//    verseRefRow: {
//      alignItems: 'center',
//      marginBottom: SPACING.medium,
//    },
//    verseChip: {
//      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
//      borderRadius: 30,
//      paddingHorizontal: 14,
//      paddingVertical: 5,
//    },
//    verseChipText: {
//      fontSize: scaledSizes.small,
//      fontWeight: '700',
//      letterSpacing: 1,
//      textTransform: 'uppercase',
//    },
//    verseText: {
//      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.15,
//      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.15) * 1.7,
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      textAlign: 'center',
//      fontStyle: 'italic',
//      fontWeight: '500',
//    },
//
//    // ── Download Card ──
//    downloadCard: {
//      marginBottom: SPACING.medium,
//    },
//    downloadBtn: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'center',
//      backgroundColor: COLORS.primary,
//      paddingVertical: 12,
//      borderRadius: RADIUS.card,
//      gap: 8,
//    },
//    downloadBtnText: {
//      color: '#FFF',
//      fontWeight: '700',
//      fontSize: scaledSizes.small,
//      letterSpacing: 0.3,
//    },
//    downloadedRow: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'center',
//      paddingVertical: 10,
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
//      borderWidth: 1,
//      borderColor: 'rgba(212, 175, 55, 0.3)',
//      gap: 8,
//    },
//    downloadedText: {
//      fontWeight: '700',
//      fontSize: scaledSizes.small,
//    },
//
//    // ── Audio Card ──
//    audioCard: {
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      overflow: 'hidden',
//      marginBottom: SPACING.medium,
//      padding: SPACING.small,
//    },
//    audioLabel: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      paddingHorizontal: SPACING.small,
//      paddingTop: SPACING.small,
//      paddingBottom: 4,
//    },
//    audioLabelText: {
//      fontSize: scaledSizes.small,
//      fontWeight: '700',
//      letterSpacing: 1,
//      textTransform: 'uppercase',
//    },
//
//    // ── Meaning Card ──
//    meaningCard: {
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      borderLeftWidth: 3,
//      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
//      padding: SPACING.large,
//      marginBottom: SPACING.medium,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 2 },
//      shadowOpacity: 0.08,
//      shadowRadius: 8,
//      elevation: 3,
//    },
//    meaningHeader: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'space-between',
//      marginBottom: SPACING.medium,
//      width: '100%',
//    },
//    meaningLabel: {
//      fontSize: scaledSizes.small,
//      fontWeight: '800',
//      letterSpacing: 2,
//    },
//    meaningText: {
//      fontSize: scaledSizes.base,
//      lineHeight: scaledSizes.base * 1.75,
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      textAlign: 'justify',
//    },
//
//    // ── TTS Button ──
//    ttsBtn: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
//      paddingHorizontal: 12,
//      paddingVertical: 6,
//      borderRadius: 20,
//      borderWidth: 1,
//      borderColor: 'rgba(212, 175, 55, 0.3)',
//      marginTop: 8,
//    },
//    ttsBtnDisabled: {
//      opacity: 0.6,
//    },
//    ttsBtnText: {
//      fontSize: scaledSizes.small * 0.9,
//      fontWeight: '700',
//      marginLeft: 6,
//      letterSpacing: 0.5,
//    },
//    loaderContainer: {
//      width: 24,
//      height: 24,
//      justifyContent: 'center',
//      alignItems: 'center',
//    },
//    ttsErrorText: {
//      fontSize: scaledSizes.small * 0.85,
//      color: COLORS.primary, // Using primary for error since maroon was undefined in global COLORS
//      textAlign: 'center',
//      marginBottom: 8,
//      fontWeight: '600',
//    },
//
//    // ── Unified Audio Styles ──
//    audioContainer: {
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.04)',
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      padding: SPACING.small,
//      marginBottom: SPACING.medium,
//    },
//
//    footerDecor: {
//      textAlign: 'center',
//      fontSize: 14,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 6,
//      marginTop: 4,
//    },
//
//    // ── Navigation Footer ──
//    footer: {
//      position: 'absolute',
//      bottom: 0,
//      left: 0,
//      right: 0,
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'space-between',
//      paddingHorizontal: SPACING.medium,
//      paddingVertical: SPACING.medium,
//      paddingBottom: SPACING.large,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderTopWidth: 1,
//      borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: -2 },
//      shadowOpacity: 0.06,
//      shadowRadius: 6,
//      elevation: 8,
//    },
//    navBtn: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'center',
//      height: 44,
//      minWidth: 92,
//      paddingHorizontal: 12,
//      borderRadius: 22,
//      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      gap: 4,
//    },
//    navBtnDisabled: {
//      opacity: 0.3,
//    },
//    navBtnLabel: {
//      fontSize: scaledSizes.small * 0.9,
//      fontWeight: '700',
//      letterSpacing: 0.3,
//    },
//    saveBtn: {
//      flex: 1,
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'center',
//      backgroundColor: COLORS.primary,
//      height: 48,
//      borderRadius: 50,
//      marginHorizontal: SPACING.medium,
//      gap: SPACING.small,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 3 },
//      shadowOpacity: 0.35,
//      shadowRadius: 8,
//      elevation: 5,
//    },
//    saveBtnActive: {
//      backgroundColor: isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00'),
//    },
//    saveBtnText: {
//      color: '#FFF',
//      fontWeight: '700',
//      fontSize: scaledSizes.base,
//      letterSpacing: 0.3,
//    },
//  });
//
//export default SlokaDetailScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  fetchSloka,
  fetchChapterByNumber,
} from '../services/supabaseService';
import { getUserId, saveLastRead } from '../services/storageService';
import { getChapterName, getSlokaText, getMeaning } from '../services/contentService';
import { generateMeaningAudio } from '../services/ttsService';
import {
  saveSlokaOffline,
  removeSlokaOffline,
  getOfflineSloka,
} from '../services/offlineService';
import AudioPlayer from '../components/AudioPlayer';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

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
const SlokaDetailScreen = ({ route, navigation }) => {
  const { chapterNumber, slokaNumber } = route?.params || {};
  const { isDark } = useTheme();

  const [sloka, setSloka] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [meaningAudioUrl, setMeaningAudioUrl] = useState(null);

  // Offline state
  const [offlineRecord, setOfflineRecord] = useState(null);
  const [downloadState, setDownloadState] = useState('idle'); // idle | downloading | downloaded
  const [downloadStage, setDownloadStage] = useState(null); // null | generating | downloading
  const [downloadProgress, setDownloadProgress] = useState({ recitation: 0, meaning: 0 });
  const [usingOfflineData, setUsingOfflineData] = useState(false);

  const isMounted = useRef(true);

  const { scaledSizes } = useFontSize();
  const t = useTranslation();
  const { language } = useLanguage();
  const { isSlokaBookmarked, toggleBookmark: toggleGlobalBookmark } = useBookmarks();

  const isFavorite = sloka ? isSlokaBookmarked(sloka.id) : false;

  // Hoisted cleanup functions
  function stopMeaningAudio() {
    if (isMounted.current) {
      setMeaningAudioUrl(null);
    }
  }

  function stopSlokaAudio() {
    // Recitation AudioPlayer is tied to sloka.audio_url
  }

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);

  // Content fade-in
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  // Pulse for loading Om
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Bookmark bounce
  const bookmarkAnim = useRef(new Animated.Value(1)).current;

  const pulseAnimRef = useRef(null);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    pulseAnimRef.current = anim;
    anim.start();
    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
      stopMeaningAudio();
      stopSlokaAudio();
    };
  }, [pulseAnim]);

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    isMounted.current = true;
    if (chapterNumber && slokaNumber) {
      loadData();
    } else {
      setError('Invalid verse parameters');
      setLoading(false);
    }
    return () => {
      isMounted.current = false;
      stopMeaningAudio();
      stopSlokaAudio();
    };
  }, [chapterNumber, slokaNumber, language]);

  // Check offline cache status whenever the verse changes
  useEffect(() => {
    let active = true;
    if (chapterNumber && slokaNumber) {
      getOfflineSloka(chapterNumber, slokaNumber).then((rec) => {
        if (active) {
          setOfflineRecord(rec);
          setDownloadState(rec ? 'downloaded' : 'idle');
        }
      });
    }
    return () => {
      active = false;
    };
  }, [chapterNumber, slokaNumber]);

  const animateContentIn = () => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const initUser = async () => {
    try {
      const id = await getUserId();
      if (isMounted.current) setUserId(id);
    } catch (e) {}
  };

  const loadData = async () => {
    try {
      if (!isMounted.current) return;
      setLoading(true);
      setError(null);
      setUsingOfflineData(false);
      stopMeaningAudio();

      let slokaData = null;
      let chapterData = null;

      try {
        [slokaData, chapterData] = await Promise.all([
          fetchSloka(chapterNumber, slokaNumber, language),
          fetchChapterByNumber(chapterNumber),
        ]);
      } catch (networkErr) {
        // Network call itself threw — fall through and try the offline cache instead.
      }

      if (!isMounted.current) return;

      if (slokaData && chapterData) {
        setSloka(slokaData);
        setChapter(chapterData);
        saveLastRead(chapterNumber, slokaNumber).catch(() => {});
        animateContentIn();
        return;
      }

      // Either the network call threw, or it resolved with empty/null data.
      const cached = await getOfflineSloka(chapterNumber, slokaNumber);
      if (isMounted.current && cached) {
        setSloka(cached.sloka);
        setChapter(cached.chapter);
        setOfflineRecord(cached);
        setDownloadState('downloaded');
        setUsingOfflineData(true);
        animateContentIn();
      } else if (isMounted.current) {
        setError(t('verse.verseNotFound'));
      }
    } catch (err) {
      const cached = await getOfflineSloka(chapterNumber, slokaNumber);
      if (isMounted.current && cached) {
        setSloka(cached.sloka);
        setChapter(cached.chapter);
        setOfflineRecord(cached);
        setDownloadState('downloaded');
        setUsingOfflineData(true);
        animateContentIn();
      } else if (isMounted.current) {
        setError('Failed to load content');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!sloka) return;
    // Bounce animation
    Animated.sequence([
      Animated.timing(bookmarkAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
      Animated.timing(bookmarkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    toggleGlobalBookmark(sloka);
  };

  const handleGenerateMeaningAudio = async () => {
    if (ttsLoading || !sloka) return;

    setTtsLoading(true);
    setTtsError(null);

    try {
      const localizedMeaning = getMeaning(sloka, sloka.translation, language);
      const url = await generateMeaningAudio(localizedMeaning, language);
      setMeaningAudioUrl(url);
    } catch (err) {
      setTtsError(t('common.error') || 'Audio generation failed');
      setTimeout(() => setTtsError(null), 3000);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleGoBack = () => {
    stopMeaningAudio();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ChaptersTab', { screen: 'ChaptersList' });
    }
  };

  // ── Sloka Navigation (Prev / Next) ─────────────────────────────────────
  const totalSlokasInChapter =
    chapter?.total_slokas || chapter?.totalSlokas || chapter?.sloka_count || null;

  const isFirstSloka = slokaNumber <= 1;
  const isLastSloka = totalSlokasInChapter ? slokaNumber >= totalSlokasInChapter : false;

  const handlePrevSloka = () => {
    if (isFirstSloka) return;
    stopMeaningAudio();
    navigation.push('SlokaDetail', {
      chapterNumber,
      slokaNumber: slokaNumber - 1,
    });
  };

  const handleNextSloka = () => {
    if (isLastSloka) return;
    stopMeaningAudio();
    navigation.push('SlokaDetail', {
      chapterNumber,
      slokaNumber: slokaNumber + 1,
    });
  };

  // ── Offline Download ────────────────────────────────────────────────────
  const handleDownloadOffline = async () => {
    if (!sloka || !chapter || downloadState === 'downloading' || ttsLoading) return;

    setDownloadState('downloading');
    setDownloadProgress({ recitation: 0, meaning: 0 });

    try {
      let audioUrlForMeaning = meaningAudioUrl;

      // If the meaning audio hasn't been generated this session, generate it
      // now and WAIT for the API to actually return it before downloading.
      if (!audioUrlForMeaning) {
        setDownloadStage('generating');
        const localizedMeaning = getMeaning(sloka, sloka.translation, language);
        audioUrlForMeaning = await generateMeaningAudio(localizedMeaning, language);
        if (isMounted.current) {
          setMeaningAudioUrl(audioUrlForMeaning);
        }
      }

      setDownloadStage('downloading');
      const record = await saveSlokaOffline(sloka, chapter, chapterNumber, slokaNumber, {
        recitationAudioUrl: sloka.audio_url,
        meaningAudioUrl: audioUrlForMeaning,
        onProgress: (type, pct) => {
          setDownloadProgress((prev) => ({ ...prev, [type]: pct }));
        },
      });

      if (isMounted.current) {
        if (record) {
          setOfflineRecord(record);
          setDownloadState('downloaded');
        } else {
          setDownloadState('idle');
          setTtsError('Download failed. Please try again.');
          setTimeout(() => setTtsError(null), 3000);
        }
      }
    } catch (e) {
      if (isMounted.current) {
        setDownloadState('idle');
        setTtsError('Could not prepare offline download. Please try again.');
        setTimeout(() => setTtsError(null), 3000);
      }
    } finally {
      if (isMounted.current) setDownloadStage(null);
    }
  };

  const handleRemoveOffline = async () => {
    await removeSlokaOffline(chapterNumber, slokaNumber);
    if (isMounted.current) {
      setOfflineRecord(null);
      setDownloadState('idle');
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
        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
          ॐ
        </Animated.Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────
  if (error || !sloka || !chapter) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
        <Text style={[styles.omLoader, { color: gold }]}>ॐ</Text>
        <Text style={styles.errorText}>{error || t('common.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleGoBack} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const localizedChapterName = getChapterName(chapter, language);
  const localizedSlokaText = getSlokaText(sloka, sloka.translation, language);
  const localizedMeaning = getMeaning(sloka, sloka.translation, language);
  const effectiveMeaningAudioUrl = meaningAudioUrl || offlineRecord?.meaningAudioPath || null;

  const downloadStatusText =
    downloadStage === 'generating'
      ? 'Generating meaning voice...'
      : sloka.audio_url
      ? `Downloading ${downloadProgress.recitation}%`
      : 'Downloading...';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* ── Decorative Header ── */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.8}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Om symbol above title */}
          <Text style={[styles.headerOm, { color: gold }]}>ॐ</Text>
          <Text style={styles.headerChapterName} numberOfLines={1}>
            {localizedChapterName}
          </Text>
          <Text style={styles.headerVerseNum}>
            {t('sloka.verse')} {slokaNumber}
          </Text>
        </View>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleToggleBookmark}
            activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
              <Icon
                name={isFavorite ? 'bookmark' : 'bookmark-border'}
                size={22}
                color={isFavorite ? gold : '#FFF'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Offline banner */}
        {usingOfflineData && (
          <View style={styles.offlineBanner}>
            <Icon name="offline-pin" size={14} color={gold} />
            <Text style={[styles.offlineBannerText, { color: gold }]}>
              Showing saved offline copy
            </Text>
          </View>
        )}

        {/* Verse Card */}
        <Animated.View
          style={[
            styles.verseCard,
            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
          ]}>
          {/* Gold top strip */}
          <View style={[styles.verseStrip, { backgroundColor: gold }]} />
          <View style={styles.verseCardInner}>
            <View style={styles.verseRefRow}>
              <View style={styles.verseChip}>
                <Text style={[styles.verseChipText, { color: gold }]}>
                  {t('chapters.chapter')} {chapterNumber}  ·  {t('sloka.verse')} {slokaNumber}
                </Text>
              </View>
            </View>
            <Text style={styles.verseText}>{localizedSlokaText}</Text>
          </View>
        </Animated.View>

        {/* Audio Player */}
        {(sloka.audio_url || offlineRecord?.recitationAudioPath) && (
          <Animated.View
            style={[
              styles.audioCard,
              { opacity: contentAnim },
            ]}>
            <View style={styles.audioLabel}>
              <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
              <Text style={[styles.audioLabelText, { color: saffron }]}>{t('sloka.playAudio') || 'Recitation'}</Text>
            </View>
            <AudioPlayer
              audioUrl={offlineRecord?.recitationAudioPath || sloka.audio_url}
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
            <Text style={[styles.meaningLabel, { color: gold }]}>
              {t('sloka.translation').toUpperCase()}/
            </Text>
          </View>

          {effectiveMeaningAudioUrl ? (
            <View style={styles.audioContainer}>
              <View style={styles.audioLabel}>
                <Icon name="volume-up" size={15} color={saffron} style={{ marginRight: 6 }} />
                <Text style={[styles.audioLabelText, { color: saffron }]}>GURU VOICE</Text>
              </View>
              <AudioPlayer
                audioUrl={effectiveMeaningAudioUrl}
                duration={0}
                chapterNumber={chapterNumber}
                verseNumber={slokaNumber}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.ttsBtn, ttsLoading && styles.ttsBtnDisabled]}
              onPress={handleGenerateMeaningAudio}
              disabled={ttsLoading}
              activeOpacity={0.7}
            >
              {ttsLoading ? (
                <View style={styles.loaderContainer}>
                   <Icon name="sync" size={18} color={gold} />
                </View>
              ) : (
                <Icon name="play-circle-outline" size={24} color={gold} />
              )}
              <Text style={[styles.ttsBtnText, { color: gold }]}>
                {ttsLoading ? (t('common.loading') || 'GENERATING...') : 'LISTEN MEANING'}
              </Text>
            </TouchableOpacity>
          )}

          {ttsError && (
            <Text style={styles.ttsErrorText}>{ttsError}</Text>
          )}

          <Text style={styles.meaningText}>{localizedMeaning}</Text>
        </Animated.View>

        {/* Download for Offline */}
        <Animated.View style={[styles.downloadCard, { opacity: contentAnim }]}>
          {downloadState === 'downloaded' ? (
            <TouchableOpacity style={styles.downloadedRow} onPress={handleRemoveOffline} activeOpacity={0.7}>
              <Icon name="offline-pin" size={20} color={gold} />
              <Text style={[styles.downloadedText, { color: gold }]}>Saved for offline</Text>
              <Icon name="delete-outline" size={18} color={saffron} />
            </TouchableOpacity>
          ) : downloadState === 'downloading' ? (
            <View style={styles.downloadedRow}>
              <Icon name="sync" size={20} color={gold} />
              <Text style={[styles.downloadedText, { color: gold }]}>
                {downloadStatusText}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadOffline} activeOpacity={0.8}>
              <Icon name="file-download" size={20} color="#FFF" />
              <Text style={styles.downloadBtnText}>Download for Offline</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

      </Animated.ScrollView>

      {/* ── Navigation Footer ── */}
      <View style={styles.footer}>
        {/* Prev */}
        <TouchableOpacity
          style={[styles.navBtn, isFirstSloka && styles.navBtnDisabled]}
          disabled={isFirstSloka}
          onPress={handlePrevSloka}
          activeOpacity={0.8}>
          <Icon
            name="chevron-left"
            size={22}
            color={isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
          />
          <Text
            style={[
              styles.navBtnLabel,
              { color: isFirstSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
            ]}
            numberOfLines={1}>
            {t('Previous') || 'Previous'}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isFavorite && styles.saveBtnActive]}
          onPress={handleToggleBookmark}
          activeOpacity={0.85}>
          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
            <Icon
              name={isFavorite ? 'bookmark' : 'bookmark-border'}
              size={20}
              color="#FFF"
            />
          </Animated.View>
          <Text style={styles.saveBtnText}>
            {isFavorite ? 'Saved Sloka' : 'Save Sloka'}
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={[styles.navBtn, isLastSloka && styles.navBtnDisabled]}
          disabled={isLastSloka}
          onPress={handleNextSloka}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.navBtnLabel,
              { color: isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold },
            ]}
            numberOfLines={1}>
            {t('Next') || 'Next'}
          </Text>
          <Icon
            name="chevron-right"
            size={22}
            color={isLastSloka ? (isDark ? COLORS.darkBorder : COLORS.border) : gold}
          />
        </TouchableOpacity>
      </View>
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

    // ── Loading / Error ──
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
      marginTop: SPACING.small,
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

    // ── Header ──
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: SPACING.xlarge,
      paddingBottom: SPACING.medium,
      paddingHorizontal: SPACING.medium,
      // Bottom gold border accent
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
    headerRightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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

    // ── Scroll ──
    scroll: { flex: 1 },
    scrollContent: {
      padding: SPACING.medium,
      paddingBottom: 100,
    },

    // ── Offline Banner ──
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

    // ── Verse Card ──
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
    verseStrip: {
      height: 3,
    },
    verseCardInner: {
      padding: SPACING.large,
    },
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

    // ── Download Card ──
    downloadCard: {
      marginBottom: SPACING.medium,
    },
    downloadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: RADIUS.card,
      gap: 8,
    },
    downloadBtnText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: scaledSizes.small,
      letterSpacing: 0.3,
    },
    downloadedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      gap: 8,
    },
    downloadedText: {
      fontWeight: '700',
      fontSize: scaledSizes.small,
    },

    // ── Audio Card ──
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

    // ── Meaning Card ──
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
      justifyContent: 'space-between',
      marginBottom: SPACING.medium,
      width: '100%',
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

    // ── TTS Button ──
    ttsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      marginTop: 8,
    },
    ttsBtnDisabled: {
      opacity: 0.6,
    },
    ttsBtnText: {
      fontSize: scaledSizes.small * 0.9,
      fontWeight: '700',
      marginLeft: 6,
      letterSpacing: 0.5,
    },
    loaderContainer: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ttsErrorText: {
      fontSize: scaledSizes.small * 0.85,
      color: COLORS.primary, // Using primary for error since maroon was undefined in global COLORS
      textAlign: 'center',
      marginBottom: 8,
      fontWeight: '600',
    },

    // ── Unified Audio Styles ──
    audioContainer: {
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      padding: SPACING.small,
      marginBottom: SPACING.medium,
    },

    footerDecor: {
      textAlign: 'center',
      fontSize: 14,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 6,
      marginTop: 4,
    },

    // ── Navigation Footer ──
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      paddingBottom: SPACING.large,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 8,
    },
    navBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      minWidth: 92,
      paddingHorizontal: 12,
      borderRadius: 22,
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      gap: 4,
    },
    navBtnDisabled: {
      opacity: 0.3,
    },
    navBtnLabel: {
      fontSize: scaledSizes.small * 0.9,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    saveBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      height: 48,
      borderRadius: 50,
      marginHorizontal: SPACING.medium,
      gap: SPACING.small,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    saveBtnActive: {
      backgroundColor: isDark ? (COLORS.primaryLight || '#FFA726') : (COLORS.primary || '#FF8C00'),
    },
    saveBtnText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: scaledSizes.base,
      letterSpacing: 0.3,
    },
  });

export default SlokaDetailScreen;
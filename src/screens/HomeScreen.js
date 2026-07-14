//import React, { useState, useEffect, useRef } from 'react';
//import {
//  View,
//  Text,
//  StyleSheet,
//  ScrollView,
//  TouchableOpacity,
//  RefreshControl,
//  Dimensions,
//  Animated,
//  StatusBar,
//} from 'react-native';
//import Icon from 'react-native-vector-icons/MaterialIcons';
//import { fetchDailySloka } from '../services/dailySlokaService';
//import { getLastRead } from '../services/storageService';
//import { useFontSize } from '../context/FontSizeContext';
//import { useTranslation } from '../hooks/useTranslation';
//import { useLanguage } from '../context/LanguageContext';
//import { getChapterName, getSlokaText } from '../services/contentService';
//import AudioPlayer from '../components/AudioPlayer';
//import { COLORS, RADIUS, SPACING } from '../constants/colors';
//import { useTheme } from '../context/ThemeContext';
//
//const { width, height } = Dimensions.get('window');
//
//// ─── Animated Fade-In Wrapper ─────────────────────────────────────────────
//const FadeIn = ({ children, delay = 0, style }) => {
//  const anim = useRef(new Animated.Value(0)).current;
//  const translateY = useRef(new Animated.Value(18)).current;
//
//  useEffect(() => {
//    Animated.parallel([
//      Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
//      Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
//    ]).start();
//  }, []);
//
//  return (
//    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
//      {children}
//    </Animated.View>
//  );
//};
//
//// ─── Decorative Om Symbol ─────────────────────────────────────────────────
//const OmDecor = ({ color, size = 28 }) => (
//  <Text style={{ fontSize: size, color, fontWeight: '300', lineHeight: size * 1.2 }}>ॐ</Text>
//);
//
//// ─── Lotus Divider ────────────────────────────────────────────────────────
//const LotusLine = ({ color }) => (
//  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
//    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
//    <Text style={{ color, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
//    <Text style={{ color, fontSize: 16, marginHorizontal: 2 }}>🪷</Text>
//    <Text style={{ color, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
//    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
//  </View>
//);
//
//// ─── Main Screen ──────────────────────────────────────────────────────────
//const HomeScreen = ({ navigation }) => {
//  const { isDark, theme } = useTheme();
//
//  const [dailySloka, setDailySloka] = useState(null);
//  const [lastRead, setLastRead] = useState(null);
//  const [loading, setLoading] = useState(true);
//  const [refreshing, setRefreshing] = useState(false);
//  const [error, setError] = useState(null);
//  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
//
//  const { scaledSizes } = useFontSize();
//  const t = useTranslation();
//
//  const { language } = useLanguage();
//
//  const styles = React.useMemo(
//    () => getStyles(isDark, scaledSizes),
//    [isDark, scaledSizes]
//  );
//
//  // Pulse animation for the Om symbol
//  const pulseAnim = useRef(new Animated.Value(1)).current;
//  useEffect(() => {
//    Animated.loop(
//      Animated.sequence([
//        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
//        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
//      ])
//    ).start();
//  }, []);
//
//  useEffect(() => {
//    loadData();
//  }, [language]);
//
//  const loadData = async () => {
//    try {
//      setError(null);
//      const [sloka, lastReadData] = await Promise.all([
//        fetchDailySloka(language),
//        getLastRead(),
//      ]);
//      if (sloka) setDailySloka(sloka);
//      if (lastReadData) setLastRead(lastReadData);
//    } catch (err) {
//      setError('Unable to load content. Please check your connection.');
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const onRefresh = async () => {
//    setRefreshing(true);
//    await loadData();
//    setRefreshing(false);
//  };
//
//  const navigateToSloka = (chapterNumber, verseNumber) => {
//    if (!chapterNumber || !verseNumber) return;
//    navigation.navigate('ChaptersTab', {
//      screen: 'SlokaDetail',
//      params: {
//        chapterNumber: parseInt(chapterNumber),
//        slokaNumber: parseInt(verseNumber),
//      },
//    });
//  };
//
//  // ── Loading State ──────────────────────────────────────────────────────
//  if (loading) {
//    const bg = isDark ? COLORS.darkBackground : COLORS.background;
//    const gold = isDark ? COLORS.darkAccentGold : COLORS.accentGold;
//    return (
//      <View style={[styles.rootContainer, styles.centerContent, { backgroundColor: bg }]}>
//        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
//        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
//          ॐ
//        </Animated.Text>
//        <Text style={styles.loadingText}>{t('common.loading')}</Text>
//      </View>
//    );
//  }
//
//  // ── Error State ────────────────────────────────────────────────────────
//  if (error) {
//    return (
//      <View style={[styles.rootContainer, styles.centerContent]}>
//        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
//        <Text style={styles.omLoader}>ॐ</Text>
//        <Text style={styles.errorText}>{error}</Text>
//        <TouchableOpacity style={styles.retryButton} onPress={loadData} activeOpacity={0.8}>
//          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
//        </TouchableOpacity>
//      </View>
//    );
//  }
//
//  const localizedChapterName = dailySloka ? getChapterName(dailySloka.chapter, language) : '';
//  const localizedSlokaText = dailySloka
//    ? getSlokaText(dailySloka, dailySloka.translation, language)
//    : '';
//
//  const saffron = isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100');
//  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
//  const goldLight = isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(232, 184, 75, 0.3)';
//
//  return (
//    <View style={styles.rootContainer}>
//      <StatusBar
//        barStyle={isDark ? 'light-content' : 'dark-content'}
//        backgroundColor={isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC')}
//      />
//
//      {/* ── Decorative Background Blobs ── */}
//      <View style={styles.bgCircle1} />
//      <View style={styles.bgCircle2} />
//
//      <ScrollView
//        style={styles.container}
//        contentContainerStyle={styles.scrollContent}
//        showsVerticalScrollIndicator={false}
//        refreshControl={
//          <RefreshControl
//            refreshing={refreshing}
//            onRefresh={onRefresh}
//            colors={[saffron]}
//            tintColor={gold}
//          />
//        }>
//
//        {/* ── Page Title ── */}
//        <FadeIn delay={0}>
//          <View style={styles.pageHeader}>
//            <Text style={styles.pageTitle}>{t('nav.home')}</Text>
//            <View style={styles.pageTitleLine} />
//          </View>
//        </FadeIn>
//
//        {/* ── Daily Verse Hero Card ── */}
//        {dailySloka && (
//          <FadeIn delay={100}>
//            <View style={styles.heroCard}>
//              <View style={styles.heroStrip} />
//              <View style={styles.heroCardInner}>
//
//                <View style={styles.heroTopRow}>
//                  <View style={styles.verseChip}>
//                    <OmDecor color={gold} size={14} />
//                    <Text style={styles.verseChipText}>
//                      {t('home.todaysVerse')}
//                    </Text>
//                  </View>
//                  {dailySloka.audio_url && (
//                    <TouchableOpacity
//                      style={styles.audioButton}
//                      onPress={() => setShowAudioPlayer(!showAudioPlayer)}
//                      activeOpacity={0.8}>
//                      <Icon
//                        name={showAudioPlayer ? 'pause' : 'volume-up'}
//                        size={18}
//                        color="#FFF"
//                      />
//                    </TouchableOpacity>
//                  )}
//                </View>
//
//                <Text style={styles.heroVerseRef}>
//                  {t('chapters.chapter')} {dailySloka.chapter_number}{'  ·  '}
//                  {t('sloka.verse')} {dailySloka.verse_number}
//                </Text>
//
//                {localizedChapterName ? (
//                  <Text style={styles.heroChapterName}>{localizedChapterName}</Text>
//                ) : null}
//
//                <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} />
//
//                <TouchableOpacity
//                  onPress={() =>
//                    navigateToSloka(dailySloka.chapter_number, dailySloka.verse_number)
//                  }
//                  activeOpacity={0.85}>
//                  <Text style={styles.heroSanskrit}>{localizedSlokaText}</Text>
//                </TouchableOpacity>
//
//                {showAudioPlayer && dailySloka.audio_url && (
//                  <View style={styles.inlineAudio}>
//                    <AudioPlayer
//                      audioUrl={dailySloka.audio_url}
//                      duration={dailySloka.audio_duration}
//                      chapterNumber={dailySloka.chapter_number}
//                      verseNumber={dailySloka.verse_number}
//                      autoPlay={true}
//                    />
//                  </View>
//                )}
//
//                <TouchableOpacity
//                  style={styles.readMoreBtn}
//                  onPress={() =>
//                    navigateToSloka(dailySloka.chapter_number, dailySloka.verse_number)
//                  }
//                  activeOpacity={0.8}>
//                  <Text style={styles.readMoreBtnText}>{t('sloka.translation')}</Text>
//                  <Icon name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
//                </TouchableOpacity>
//
//              </View>
//            </View>
//          </FadeIn>
//        )}
//
//        {/* ── Continue Reading ── */}
//        {lastRead && (
//          <FadeIn delay={200}>
//            <View style={styles.sectionHeader}>
//              <Text style={styles.sectionLabel}>{t('home.exploreChapters')}</Text>
//            </View>
//            <TouchableOpacity
//              style={styles.continueCard}
//              onPress={() => navigateToSloka(lastRead.chapterNumber, lastRead.slokaNumber)}
//              activeOpacity={0.8}>
//              <View style={styles.continueIconWrap}>
//                <Icon name="bookmark" size={20} color={saffron} />
//              </View>
//              <View style={styles.continueContent}>
//                <Text style={styles.continueTitle}>
//                  {t('chapters.chapter')} {lastRead.chapterNumber}{'  '}
//                  {t('sloka.verse')} {lastRead.slokaNumber}
//                </Text>
//              </View>
//              <View style={styles.continueArrow}>
//                <Icon name="chevron-right" size={22} color={gold} />
//              </View>
//            </TouchableOpacity>
//          </FadeIn>
//        )}
//
//        {/* ── Explore Section ── */}
//        <FadeIn delay={300}>
//          <View style={styles.sectionHeader}>
//            <Text style={styles.sectionLabel}>{t('home.sectionExplore')}</Text>
//          </View>
//          <View style={styles.navGrid}>
//
//            {/* Chapters Card */}
//            <TouchableOpacity
//              style={[styles.navCard, styles.navCardChapters]}
//              onPress={() => navigation.navigate('ChaptersTab', { screen: 'ChaptersList' })}
//              activeOpacity={0.85}>
//              <View style={styles.navIconRing}>
//                <Icon name="menu-book" size={28} color={isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.primary || '#FF8C00')} />
//              </View>
//              <Text style={styles.navCardTitle}>{t('common.chapters')}</Text>
//              <Text style={styles.navCardSub}>18 {t('chapters.versesCount')}</Text>
//              <View style={styles.navCardDecor}>
//                <Text style={{ color: goldLight, fontSize: 30, opacity: 0.18 }}>ॐ</Text>
//              </View>
//            </TouchableOpacity>
//
//            {/* Geet AI Card */}
//            <TouchableOpacity
//              style={[styles.navCard, styles.navCardVoice]}
//              onPress={() => navigation.navigate('GeetAITab')}
//              activeOpacity={0.85}>
//              <View style={[styles.navIconRing, styles.navIconRingVoice]}>
//                <Icon name="auto-awesome" size={28} color={saffron} />
//              </View>
//              <Text style={styles.navCardTitle}>{t('common.geetAI')}</Text>
//              <Text style={styles.navCardSub}>{t('voice.title')}</Text>
//              <View style={styles.navCardDecor}>
//                <Text style={{ color: isDark ? 'rgba(245, 136, 58, 0.3)' : 'rgba(232, 100, 10, 0.3)', fontSize: 30, opacity: 0.18 }}>🪷</Text>
//              </View>
//            </TouchableOpacity>
//
//            {/* Saved Verses Card */}
//            <TouchableOpacity
//              style={[styles.navCard, styles.navCardSaved]}
//              onPress={() => navigation.navigate('SavedSlokas')}
//              activeOpacity={0.85}>
//              <View style={[styles.navIconRing, styles.navIconRingSaved]}>
//                <Icon name="bookmark" size={28} color={gold} />
//              </View>
//              <Text style={styles.navCardTitle}>{t('common.savedVerses')}</Text>
//              <Text style={styles.navCardSub}>{t('nav.saved')}</Text>
//              <View style={styles.navCardDecor}>
//                <Text style={{ color: goldLight, fontSize: 30, opacity: 0.18 }}>✦</Text>
//              </View>
//            </TouchableOpacity>
//
//          </View>
//        </FadeIn>
//
//
//      </ScrollView>
//    </View>
//  );
//};
//
//// ─── Styles ───────────────────────────────────────────────────────────────
//const getStyles = (isDark, scaledSizes) =>
//  StyleSheet.create({
//    rootContainer: {
//      flex: 1,
//      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
//    },
//    bgCircle1: {
//      position: 'absolute',
//      width: width * 0.7,
//      height: width * 0.7,
//      borderRadius: width * 0.35,
//      backgroundColor: isDark ? 'rgba(255,215,0,0.03)' : 'rgba(200,137,42,0.07)',
//      top: -width * 0.2,
//      right: -width * 0.2,
//    },
//    bgCircle2: {
//      position: 'absolute',
//      width: width * 0.5,
//      height: width * 0.5,
//      borderRadius: width * 0.25,
//      backgroundColor: isDark ? 'rgba(232,100,10,0.03)' : 'rgba(232,100,10,0.05)',
//      bottom: height * 0.2,
//      left: -width * 0.15,
//    },
//    container: { flex: 1 },
//    scrollContent: {
//      paddingBottom: SPACING.xlarge * 2,
//      paddingTop: SPACING.medium,
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
//      fontSize: 72,
//      marginBottom: SPACING.medium,
//      textAlign: 'center',
//    },
//    loadingText: {
//      marginTop: SPACING.small,
//      fontSize: scaledSizes.base,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 1.5,
//      textTransform: 'uppercase',
//    },
//    errorText: {
//      marginTop: SPACING.medium,
//      fontSize: scaledSizes.base,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      textAlign: 'center',
//      lineHeight: scaledSizes.base * 1.6,
//      marginBottom: SPACING.large,
//    },
//    retryButton: {
//      backgroundColor: COLORS.primary,
//      paddingHorizontal: SPACING.xlarge,
//      paddingVertical: SPACING.medium,
//      borderRadius: 50,
//    },
//    retryButtonText: {
//      color: '#FFF',
//      fontSize: scaledSizes.base,
//      fontWeight: '700',
//    },
//
//    // ── Page Header ──
//    pageHeader: {
//      paddingHorizontal: SPACING.medium,
//      paddingVertical: SPACING.medium,
//    },
//    pageTitle: {
//      fontSize: 28,
//      fontWeight: '800',
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      letterSpacing: 0.5,
//    },
//    pageTitleLine: {
//      width: 40,
//      height: 4,
//      backgroundColor: COLORS.primary,
//      borderRadius: 2,
//      marginTop: 4,
//    },
//
//    // ── Hero Card ──
//    heroCard: {
//      marginHorizontal: SPACING.medium,
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      overflow: 'hidden',
//      shadowColor: isDark ? '#000' : COLORS.accentGold,
//      shadowOffset: { width: 0, height: 6 },
//      shadowOpacity: isDark ? 0.4 : 0.15,
//      shadowRadius: 16,
//      elevation: 10,
//      marginBottom: SPACING.large,
//    },
//    heroStrip: {
//      height: 4,
//      backgroundColor: COLORS.primary,
//    },
//    heroCardInner: {
//      padding: SPACING.large,
//    },
//    heroTopRow: {
//      flexDirection: 'row',
//      justifyContent: 'space-between',
//      alignItems: 'center',
//      marginBottom: SPACING.small,
//    },
//    verseChip: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)',
//      borderRadius: 30,
//      paddingHorizontal: 12,
//      paddingVertical: 5,
//      gap: 5,
//    },
//    verseChipText: {
//      fontSize: scaledSizes.small,
//      color: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
//      fontWeight: '700',
//      letterSpacing: 0.5,
//      textTransform: 'uppercase',
//    },
//    audioButton: {
//      width: 38,
//      height: 38,
//      borderRadius: 19,
//      backgroundColor: COLORS.primary,
//      justifyContent: 'center',
//      alignItems: 'center',
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 3 },
//      shadowOpacity: 0.4,
//      shadowRadius: 6,
//      elevation: 4,
//    },
//    heroVerseRef: {
//      fontSize: scaledSizes.small,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 1.5,
//      textTransform: 'uppercase',
//      marginBottom: 4,
//    },
//    heroChapterName: {
//      fontSize: scaledSizes.large * 1.15,
//      fontWeight: '800',
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      lineHeight: scaledSizes.large * 1.5,
//      marginBottom: 4,
//    },
//    heroSanskrit: {
//      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.1,
//      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.1) * 1.7,
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      fontStyle: 'italic',
//      marginVertical: SPACING.small,
//      textAlign: 'center',
//    },
//    inlineAudio: {
//      marginTop: SPACING.medium,
//      borderRadius: RADIUS.small,
//      overflow: 'hidden',
//      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
//    },
//    readMoreBtn: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      justifyContent: 'center',
//      backgroundColor: COLORS.primary,
//      borderRadius: 50,
//      paddingVertical: SPACING.medium - 2,
//      paddingHorizontal: SPACING.large,
//      marginTop: SPACING.medium,
//      alignSelf: 'stretch',
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 3 },
//      shadowOpacity: 0.35,
//      shadowRadius: 8,
//      elevation: 5,
//    },
//    readMoreBtnText: {
//      color: '#FFF',
//      fontSize: scaledSizes.base,
//      fontWeight: '700',
//      letterSpacing: 0.4,
//    },
//
//    // ── Section Header ──
//    sectionHeader: {
//      paddingHorizontal: SPACING.medium,
//      marginBottom: SPACING.small,
//      marginTop: SPACING.small,
//    },
//    sectionLabel: {
//      fontSize: scaledSizes.base,
//      fontWeight: '700',
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 2,
//      textTransform: 'uppercase',
//    },
//
//    // ── Continue Card ──
//    continueCard: {
//      flexDirection: 'row',
//      alignItems: 'center',
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderRadius: RADIUS.card,
//      marginHorizontal: SPACING.medium,
//      marginBottom: SPACING.large,
//      padding: SPACING.medium,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      shadowColor: '#000',
//      shadowOffset: { width: 0, height: 3 },
//      shadowOpacity: 0.1,
//      shadowRadius: 8,
//      elevation: 4,
//    },
//    continueIconWrap: {
//      width: 44,
//      height: 44,
//      borderRadius: 22,
//      backgroundColor: isDark ? 'rgba(128, 48, 0, 0.15)' : 'rgba(128, 48, 0, 0.1)',
//      justifyContent: 'center',
//      alignItems: 'center',
//      marginRight: SPACING.medium,
//    },
//    continueContent: { flex: 1 },
//    continueLabel: {
//      fontSize: scaledSizes.small,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      letterSpacing: 1,
//      textTransform: 'uppercase',
//      marginBottom: 2,
//    },
//    continueTitle: {
//      fontSize: scaledSizes.base,
//      fontWeight: '700',
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//    },
//    continueArrow: {
//      width: 32,
//      height: 32,
//      borderRadius: 16,
//      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt,
//      justifyContent: 'center',
//      alignItems: 'center',
//    },
//
//    // ── Nav Grid ──
//    navGrid: {
//      flexDirection: 'row',
//      marginHorizontal: SPACING.medium,
//      gap: SPACING.medium,
//      marginBottom: SPACING.large,
//    },
//    navCard: {
//      flex: 1,
//      borderRadius: RADIUS.card,
//      padding: SPACING.medium,
//      overflow: 'hidden',
//      borderWidth: 1,
//      shadowOffset: { width: 0, height: 4 },
//      shadowOpacity: 0.12,
//      shadowRadius: 12,
//      elevation: 6,
//      minHeight: 140,
//    },
//    navCardChapters: {
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      shadowColor: '#000',
//    },
//    navCardVoice: {
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      shadowColor: '#000',
//    },
//    navCardSaved: {
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      shadowColor: '#000',
//    },
//    navIconRing: {
//      width: 52,
//      height: 52,
//      borderRadius: 26,
//      backgroundColor: isDark ? 'rgba(128, 26, 46, 0.1)' : 'rgba(139, 26, 46, 0.1)',
//      justifyContent: 'center',
//      alignItems: 'center',
//      marginBottom: SPACING.small,
//    },
//    navIconRingVoice: {
//      backgroundColor: isDark ? 'rgba(232, 100, 10, 0.1)' : 'rgba(232, 100, 10, 0.1)',
//    },
//    navIconRingSaved: {
//      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.1)',
//    },
//    navCardTitle: {
//      fontSize: scaledSizes.base,
//      fontWeight: '800',
//      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
//      marginBottom: 3,
//    },
//    navCardSub: {
//      fontSize: scaledSizes.small,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      lineHeight: scaledSizes.small * 1.4,
//    },
//    navCardDecor: {
//      position: 'absolute',
//      bottom: 8,
//      right: 10,
//    },
//
//    // ── About Card ──
//    aboutCard: {
//      marginHorizontal: SPACING.medium,
//      marginBottom: SPACING.large,
//      borderRadius: RADIUS.card,
//      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
//      padding: SPACING.large,
//      borderWidth: 1,
//      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
//      borderLeftWidth: 3,
//      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
//      alignItems: 'center',
//    },
//    aboutText: {
//      fontSize: scaledSizes.small * 1.05,
//      lineHeight: scaledSizes.small * 1.85,
//      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
//      textAlign: 'center',
//      marginTop: SPACING.small,
//      fontStyle: 'italic',
//    },
//    aboutAttrib: {
//      fontSize: scaledSizes.small,
//      color: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
//      fontWeight: '600',
//      letterSpacing: 0.5,
//      marginTop: 4,
//    },
//  });
//
//export default HomeScreen;


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchDailySloka } from '../services/dailySlokaService';
import { getLastRead } from '../services/storageService';
import { useFontSize } from '../context/FontSizeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { getChapterName, getSlokaText } from '../services/contentService';
import AudioPlayer from '../components/AudioPlayer';
import { COLORS, RADIUS, SPACING } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// ─── Animated Fade-In Wrapper ─────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ─── Decorative Om Symbol ─────────────────────────────────────────────────
const OmDecor = ({ color, size = 28 }) => (
  <Text style={{ fontSize: size, color, fontWeight: '300', lineHeight: size * 1.2 }}>ॐ</Text>
);

// ─── Lotus Divider ────────────────────────────────────────────────────────
const LotusLine = ({ color }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
    <Text style={{ color, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
    <Text style={{ color, fontSize: 16, marginHorizontal: 2 }}>🪷</Text>
    <Text style={{ color, fontSize: 12, marginHorizontal: 8 }}>✦</Text>
    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { isDark, theme } = useTheme();

  const [dailySloka, setDailySloka] = useState(null);
  const [lastRead, setLastRead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const { scaledSizes } = useFontSize();
  const t = useTranslation();

  const { language } = useLanguage();

  const styles = React.useMemo(
    () => getStyles(isDark, scaledSizes),
    [isDark, scaledSizes]
  );

  // Pulse animation for the Om symbol
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    loadData();
  }, [language]);

  const loadData = async () => {
    try {
      setError(null);
      const [sloka, lastReadData] = await Promise.all([
        fetchDailySloka(language),
        getLastRead(),
      ]);
      if (sloka) setDailySloka(sloka);
      if (lastReadData) setLastRead(lastReadData);
    } catch (err) {
      setError('Unable to load content. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToSloka = (chapterNumber, verseNumber) => {
    if (!chapterNumber || !verseNumber) return;
    navigation.navigate('ChaptersTab', {
      screen: 'SlokaDetail',
      params: {
        chapterNumber: parseInt(chapterNumber),
        slokaNumber: parseInt(verseNumber),
      },
    });
  };

  // ── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    const bg = isDark ? COLORS.darkBackground : COLORS.background;
    const gold = isDark ? COLORS.darkAccentGold : COLORS.accentGold;
    return (
      <View style={[styles.rootContainer, styles.centerContent, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
          ॐ
        </Animated.Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.rootContainer, styles.centerContent]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Text style={styles.omLoader}>ॐ</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const localizedChapterName = dailySloka ? getChapterName(dailySloka.chapter, language) : '';
  const localizedSlokaText = dailySloka
    ? getSlokaText(dailySloka, dailySloka.translation, language)
    : '';

  const saffron = isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100');
  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const goldLight = isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(232, 184, 75, 0.3)';

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC')}
      />

      {/* ── Decorative Background Blobs ── */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[saffron]}
            tintColor={gold}
          />
        }>

        {/* ── Page Title ── */}
        <FadeIn delay={0}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>{t('nav.home')}</Text>
            <View style={styles.pageTitleLine} />
          </View>
        </FadeIn>

        {/* ── Daily Verse Hero Card ── */}
        {dailySloka && (
          <FadeIn delay={100}>
            <View style={styles.heroCard}>
              <View style={styles.heroStrip} />
              <View style={styles.heroCardInner}>

                <View style={styles.heroTopRow}>
                  <View style={styles.verseChip}>
                    <OmDecor color={gold} size={14} />
                    <Text style={styles.verseChipText}>
                      {t('home.todaysVerse')}
                    </Text>
                  </View>
                  {dailySloka.audio_url && (
                    <TouchableOpacity
                      style={styles.audioButton}
                      onPress={() => setShowAudioPlayer(!showAudioPlayer)}
                      activeOpacity={0.8}>
                      <Icon
                        name={showAudioPlayer ? 'pause' : 'volume-up'}
                        size={18}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.heroVerseRef}>
                  {t('chapters.chapter')} {dailySloka.chapter_number}{'  ·  '}
                  {t('sloka.verse')} {dailySloka.verse_number}
                </Text>

                {localizedChapterName ? (
                  <Text style={styles.heroChapterName}>{localizedChapterName}</Text>
                ) : null}

                <LotusLine color={isDark ? COLORS.darkBorder : COLORS.border} />

                <TouchableOpacity
                  onPress={() =>
                    navigateToSloka(dailySloka.chapter_number, dailySloka.verse_number)
                  }
                  activeOpacity={0.85}>
                  <Text style={styles.heroSanskrit}>{localizedSlokaText}</Text>
                </TouchableOpacity>

                {showAudioPlayer && dailySloka.audio_url && (
                  <View style={styles.inlineAudio}>
                    <AudioPlayer
                      audioUrl={dailySloka.audio_url}
                      duration={dailySloka.audio_duration}
                      chapterNumber={dailySloka.chapter_number}
                      verseNumber={dailySloka.verse_number}
                      autoPlay={true}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.readMoreBtn}
                  onPress={() =>
                    navigateToSloka(dailySloka.chapter_number, dailySloka.verse_number)
                  }
                  activeOpacity={0.8}>
                  <Text style={styles.readMoreBtnText}>{t('sloka.translation')}</Text>
                  <Icon name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

              </View>
            </View>
          </FadeIn>
        )}

        {/* ── Continue Reading ── */}
        {lastRead && (
          <FadeIn delay={200}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{t('home.exploreChapters')}</Text>
            </View>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => navigateToSloka(lastRead.chapterNumber, lastRead.slokaNumber)}
              activeOpacity={0.8}>
              <View style={styles.continueIconWrap}>
                <Icon name="bookmark" size={20} color={saffron} />
              </View>
              <View style={styles.continueContent}>
                <Text style={styles.continueTitle}>
                  {t('chapters.chapter')} {lastRead.chapterNumber}{'  '}
                  {t('sloka.verse')} {lastRead.slokaNumber}
                </Text>
              </View>
              <View style={styles.continueArrow}>
                <Icon name="chevron-right" size={22} color={gold} />
              </View>
            </TouchableOpacity>
          </FadeIn>
        )}

        {/* ── Offline Library ── */}
        <FadeIn delay={220}>
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => navigation.navigate('OfflineLibrary')}
            activeOpacity={0.8}>
            <View style={styles.continueIconWrap}>
              <Icon name="offline-pin" size={20} color={saffron} />
            </View>
            <View style={styles.continueContent}>
              <Text style={styles.continueTitle}>Offline Library</Text>
            </View>
            <View style={styles.continueArrow}>
              <Icon name="chevron-right" size={22} color={gold} />
            </View>
          </TouchableOpacity>
        </FadeIn>

        {/* ── Explore Section ── */}
        <FadeIn delay={300}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('home.sectionExplore')}</Text>
          </View>
          <View style={styles.navGrid}>

            {/* Chapters Card */}
            <TouchableOpacity
              style={[styles.navCard, styles.navCardChapters]}
              onPress={() => navigation.navigate('ChaptersTab', { screen: 'ChaptersList' })}
              activeOpacity={0.85}>
              <View style={styles.navIconRing}>
                <Icon name="menu-book" size={28} color={isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.primary || '#FF8C00')} />
              </View>
              <Text style={styles.navCardTitle}>{t('common.chapters')}</Text>
              <Text style={styles.navCardSub}>18 {t('chapters.versesCount')}</Text>
              <View style={styles.navCardDecor}>
                <Text style={{ color: goldLight, fontSize: 30, opacity: 0.18 }}>ॐ</Text>
              </View>
            </TouchableOpacity>

            {/* Geet AI Card */}
            <TouchableOpacity
              style={[styles.navCard, styles.navCardVoice]}
              onPress={() => navigation.navigate('GeetAITab')}
              activeOpacity={0.85}>
              <View style={[styles.navIconRing, styles.navIconRingVoice]}>
                <Icon name="auto-awesome" size={28} color={saffron} />
              </View>
              <Text style={styles.navCardTitle}>{t('common.geetAI')}</Text>
              <Text style={styles.navCardSub}>{t('voice.title')}</Text>
              <View style={styles.navCardDecor}>
                <Text style={{ color: isDark ? 'rgba(245, 136, 58, 0.3)' : 'rgba(232, 100, 10, 0.3)', fontSize: 30, opacity: 0.18 }}>🪷</Text>
              </View>
            </TouchableOpacity>

            {/* Saved Verses Card */}
            <TouchableOpacity
              style={[styles.navCard, styles.navCardSaved]}
              onPress={() => navigation.navigate('SavedSlokas')}
              activeOpacity={0.85}>
              <View style={[styles.navIconRing, styles.navIconRingSaved]}>
                <Icon name="bookmark" size={28} color={gold} />
              </View>
              <Text style={styles.navCardTitle}>{t('common.savedVerses')}</Text>
              <Text style={styles.navCardSub}>{t('nav.saved')}</Text>
              <View style={styles.navCardDecor}>
                <Text style={{ color: goldLight, fontSize: 30, opacity: 0.18 }}>✦</Text>
              </View>
            </TouchableOpacity>

          </View>
        </FadeIn>


      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────
const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
    },
    bgCircle1: {
      position: 'absolute',
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: width * 0.35,
      backgroundColor: isDark ? 'rgba(255,215,0,0.03)' : 'rgba(200,137,42,0.07)',
      top: -width * 0.2,
      right: -width * 0.2,
    },
    bgCircle2: {
      position: 'absolute',
      width: width * 0.5,
      height: width * 0.5,
      borderRadius: width * 0.25,
      backgroundColor: isDark ? 'rgba(232,100,10,0.03)' : 'rgba(232,100,10,0.05)',
      bottom: height * 0.2,
      left: -width * 0.15,
    },
    container: { flex: 1 },
    scrollContent: {
      paddingBottom: SPACING.xlarge * 2,
      paddingTop: SPACING.medium,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.large,
    },

    // ── Loading / Error ──
    omLoader: {
      fontSize: 72,
      marginBottom: SPACING.medium,
      textAlign: 'center',
    },
    loadingText: {
      marginTop: SPACING.small,
      fontSize: scaledSizes.base,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    errorText: {
      marginTop: SPACING.medium,
      fontSize: scaledSizes.base,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: scaledSizes.base * 1.6,
      marginBottom: SPACING.large,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.xlarge,
      paddingVertical: SPACING.medium,
      borderRadius: 50,
    },
    retryButtonText: {
      color: '#FFF',
      fontSize: scaledSizes.base,
      fontWeight: '700',
    },

    // ── Page Header ──
    pageHeader: {
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      letterSpacing: 0.5,
    },
    pageTitleLine: {
      width: 40,
      height: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 2,
      marginTop: 4,
    },

    // ── Hero Card ──
    heroCard: {
      marginHorizontal: SPACING.medium,
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      overflow: 'hidden',
      shadowColor: isDark ? '#000' : COLORS.accentGold,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 16,
      elevation: 10,
      marginBottom: SPACING.large,
    },
    heroStrip: {
      height: 4,
      backgroundColor: COLORS.primary,
    },
    heroCardInner: {
      padding: SPACING.large,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    verseChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)',
      borderRadius: 30,
      paddingHorizontal: 12,
      paddingVertical: 5,
      gap: 5,
    },
    verseChipText: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    audioButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    heroVerseRef: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    heroChapterName: {
      fontSize: scaledSizes.large * 1.15,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      lineHeight: scaledSizes.large * 1.5,
      marginBottom: 4,
    },
    heroSanskrit: {
      fontSize: scaledSizes.sanskrit || scaledSizes.base * 1.1,
      lineHeight: (scaledSizes.sanskrit || scaledSizes.base * 1.1) * 1.7,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      fontStyle: 'italic',
      marginVertical: SPACING.small,
      textAlign: 'center',
    },
    inlineAudio: {
      marginTop: SPACING.medium,
      borderRadius: RADIUS.small,
      overflow: 'hidden',
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : (COLORS.surfaceAlt || '#FEF0E0'),
    },
    readMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      borderRadius: 50,
      paddingVertical: SPACING.medium - 2,
      paddingHorizontal: SPACING.large,
      marginTop: SPACING.medium,
      alignSelf: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    readMoreBtnText: {
      color: '#FFF',
      fontSize: scaledSizes.base,
      fontWeight: '700',
      letterSpacing: 0.4,
    },

    // ── Section Header ──
    sectionHeader: {
      paddingHorizontal: SPACING.medium,
      marginBottom: SPACING.small,
      marginTop: SPACING.small,
    },
    sectionLabel: {
      fontSize: scaledSizes.base,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },

    // ── Continue Card ──
    continueCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderRadius: RADIUS.card,
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.large,
      padding: SPACING.medium,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    continueIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(128, 48, 0, 0.15)' : 'rgba(128, 48, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.medium,
    },
    continueContent: { flex: 1 },
    continueLabel: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    continueTitle: {
      fontSize: scaledSizes.base,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    continueArrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Nav Grid ──
    navGrid: {
      flexDirection: 'row',
      marginHorizontal: SPACING.medium,
      gap: SPACING.medium,
      marginBottom: SPACING.large,
    },
    navCard: {
      flex: 1,
      borderRadius: RADIUS.card,
      padding: SPACING.medium,
      overflow: 'hidden',
      borderWidth: 1,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      minHeight: 140,
    },
    navCardChapters: {
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
    },
    navCardVoice: {
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
    },
    navCardSaved: {
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
    },
    navIconRing: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: isDark ? 'rgba(128, 26, 46, 0.1)' : 'rgba(139, 26, 46, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    navIconRingVoice: {
      backgroundColor: isDark ? 'rgba(232, 100, 10, 0.1)' : 'rgba(232, 100, 10, 0.1)',
    },
    navIconRingSaved: {
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.1)',
    },
    navCardTitle: {
      fontSize: scaledSizes.base,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: 3,
    },
    navCardSub: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      lineHeight: scaledSizes.small * 1.4,
    },
    navCardDecor: {
      position: 'absolute',
      bottom: 8,
      right: 10,
    },

    // ── About Card ──
    aboutCard: {
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.large,
      borderRadius: RADIUS.card,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      padding: SPACING.large,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      borderLeftWidth: 3,
      borderLeftColor: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      alignItems: 'center',
    },
    aboutText: {
      fontSize: scaledSizes.small * 1.05,
      lineHeight: scaledSizes.small * 1.85,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.small,
      fontStyle: 'italic',
    },
    aboutAttrib: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginTop: 4,
    },
  });

export default HomeScreen;
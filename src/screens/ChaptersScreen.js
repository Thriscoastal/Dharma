import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchChapters } from '../services/supabaseService';
import ChapterItem from '../components/ChapterItem';
import SearchBar from '../components/SearchBar';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── FadeIn: safe for top-level JSX only, NOT inside renderItem ───────────
const FadeIn = ({ children, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ─── AnimatedChapterItem: proper component so hooks are valid in FlatList ──
const AnimatedChapterItem = ({ item, index, onPress, isDark, scaledSizes, language }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    const delay = Math.min(index * 40, 400);
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <ChapterItem
        chapter={item}
        onPress={onPress}
        isDark={isDark}
        scaledSizes={scaledSizes}
        language={language}
      />
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
const ChaptersScreen = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { scaledSizes } = useFontSize();
  const t = useTranslation();
  const { language } = useLanguage();

  // Animated sliding pill for tabs
  const tabAnim = useRef(new Animated.Value(0)).current;

  // Pulse for loading Om
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimRef = useRef(null);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulseAnimRef.current = anim;
    anim.start();
    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
    };
  }, [pulseAnim]);

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChapters();
      const chaptersData = Array.isArray(data) ? data : [];
      if (chaptersData.length === 0) setError(t('chapters.noChapters'));
      setChapters(chaptersData);
      setFilteredChapters(chaptersData);
    } catch (err) {
      setError('Unable to load chapters. Please try again.');
      setChapters([]);
      setFilteredChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChapters();
    setRefreshing(false);
  };

  const handleSearch = (searchText) => {
    setSearchQuery(searchText);
    if (!searchText) {
      setFilteredChapters(chapters);
      return;
    }
    const filtered = chapters.filter((chapter) =>
      chapter.name_english?.toLowerCase().includes(searchText.toLowerCase()) ||
      chapter.name_sanskrit?.toLowerCase().includes(searchText.toLowerCase()) ||
      chapter.chapter_number?.toString().includes(searchText)
    );
    setFilteredChapters(filtered);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.timing(tabAnim, {
      toValue: tab === 'all' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    if (tab === 'saved') {
      navigation.navigate('SavedSlokas');
    }
  };

  const navigateToSlokaList = (chapter) => {
    navigation.navigate('SlokaList', { chapter });
  };

  // ── renderItem: uses AnimatedChapterItem component (hooks-safe) ──────
  const renderItem = ({ item, index }) => (
    <AnimatedChapterItem
      item={item}
      index={index}
      onPress={() => navigateToSlokaList(item)}
      isDark={isDark}
      scaledSizes={scaledSizes}
      language={language}
    />
  );

  // ── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    const gold = isDark ? COLORS.darkAccentGold : COLORS.accentGold;
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Animated.Text style={[styles.omLoader, { transform: [{ scale: pulseAnim }], color: gold }]}>
          ॐ
        </Animated.Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────
  if (error && chapters.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Text style={styles.omLoader}>ॐ</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChapters} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tab indicator interpolated position
  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const saffron = isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100');
  const bg = isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC');

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />

      {/* ── Decorative bg blob ── */}
      <View style={styles.bgBlob} />

      {/* ── Page Title ── */}
      <FadeIn delay={0}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>{t('nav.chapters')}</Text>
          <View style={styles.pageTitleLine} />
        </View>
      </FadeIn>

      {/* ── Tab Bar ── */}
      <FadeIn delay={0}>
        <View style={styles.tabWrapper}>
          <Animated.View style={[styles.tabPill, { left: tabIndicatorLeft }]} />
          <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('all')} activeOpacity={0.8}>
            <Icon name="menu-book" size={17} color={activeTab === 'all' ? '#FFF' : (isDark ? COLORS.darkTextSecondary : COLORS.textSecondary)} style={{ marginRight: 5 }} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              {t('common.chapters')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('saved')} activeOpacity={0.8}>
            <Icon name="bookmark" size={17} color={activeTab === 'saved' ? '#FFF' : (isDark ? COLORS.darkTextSecondary : COLORS.textSecondary)} style={{ marginRight: 5 }} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              {t('common.savedVerses')}
            </Text>
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* ── Search Bar ── */}
      <FadeIn delay={80}>
        <View style={styles.searchWrapper}>
          <SearchBar
            onSearch={handleSearch}
            placeholder={t('common.search')}
            isDark={isDark}
          />
        </View>
      </FadeIn>

      {/* ── Chapter count badge ── */}
      {!searchQuery && chapters.length > 0 && (
        <FadeIn delay={120}>
          <View style={styles.countRow}>
            <View style={styles.omDot}>
              <Text style={{ color: gold, fontSize: 11 }}>ॐ</Text>
            </View>
            <Text style={styles.countText}>
              {chapters.length} {t('common.chapters')}
            </Text>
            <View style={styles.countLine} />
          </View>
        </FadeIn>
      )}

      {/* ── Empty Search Result ── */}
      {filteredChapters.length === 0 && chapters.length > 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyOm}>ॐ</Text>
          <Text style={styles.emptyTitle}>{t('common.error')}</Text>
          <Text style={styles.emptySub}>{t('common.retry')}</Text>
        </View>
      ) : (
        // ── Chapters List ──
        <FlatList
          data={filteredChapters}
          keyExtractor={(item) => item.id?.toString() || item.chapter_number?.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[saffron]}
              tintColor={gold}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.listFooter}>
              <Text style={styles.listFooterText}>✦  ॐ  ✦</Text>
            </View>
          }
        />
      )}
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
    bgBlob: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
      backgroundColor: isDark ? 'rgba(255,215,0,0.02)' : 'rgba(200,137,42,0.05)',
      top: -width * 0.3,
      right: -width * 0.3,
      zIndex: 0,
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
      paddingTop: SPACING.medium,
      paddingBottom: SPACING.small,
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
    // ── Tab Bar ──
    tabWrapper: {
      flexDirection: 'row',
      marginHorizontal: SPACING.medium,
      marginTop: SPACING.medium,
      marginBottom: SPACING.small,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surfaceAlt,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      padding: 4,
      position: 'relative',
      height: 46,
      overflow: 'hidden',
    },
    tabPill: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      width: '50%',
      backgroundColor: COLORS.primary,
      borderRadius: 50,
      zIndex: 0,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    tabText: {
      fontSize: scaledSizes.small,
      fontWeight: '600',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
    },
    tabTextActive: {
      color: '#FFF',
      fontWeight: '700',
    },
    // ── Search ──
    searchWrapper: {
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.small,
    },
    // ── Count Row ──
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.medium,
      marginBottom: SPACING.small,
    },
    omDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.small,
    },
    countText: {
      fontSize: scaledSizes.small,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginRight: SPACING.small,
    },
    countLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    // ── List ──
    listContent: {
      paddingHorizontal: SPACING.medium,
      paddingBottom: SPACING.xlarge,
    },
    listFooter: {
      alignItems: 'center',
      paddingVertical: SPACING.large,
    },
    listFooterText: {
      fontSize: 16,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      letterSpacing: 6,
    },
    // ── Empty State ──
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: SPACING.xlarge * 2,
    },
    emptyOm: {
      fontSize: 48,
      color: isDark ? COLORS.darkAccentGold : COLORS.accentGold,
      marginBottom: SPACING.medium,
    },
    emptyTitle: {
      fontSize: scaledSizes.large,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.small,
    },
    emptySub: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
    },
  });

export default ChaptersScreen;

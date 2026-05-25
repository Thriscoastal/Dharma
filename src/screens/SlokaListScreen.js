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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchSlokasWithTranslations } from '../services/supabaseService';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { getChapterName, getSlokaText } from '../services/contentService';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── FadeIn Helper ───
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

// ─── AnimatedSlokaItem: proper component so hooks are valid in FlatList ──
const AnimatedSlokaItem = ({ item, index, onPress, isDark, scaledSizes, language, t, chapterNumber }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const { isSlokaBookmarked } = useBookmarks();
  const isSaved = isSlokaBookmarked(item.id);

  useEffect(() => {
    const delay = Math.min(index * 40, 400);
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const slokaText = getSlokaText(item, item.translation, language);
  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={[
          styles.slokaItem,
          {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
            borderColor: isDark ? COLORS.darkBorder : COLORS.border,
            shadowColor: isDark ? '#000' : gold,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.numberContainer, { backgroundColor: gold }]}>
          <Text style={styles.numberText}>{item.verse_number}</Text>
        </View>
        <View style={styles.slokaContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.verseTitle, { color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary, fontSize: scaledSizes.base * 1.1 }]}>
              {t('chapters.chapter')} {chapterNumber}, {t('sloka.verse')} {item.verse_number}
            </Text>
            {isSaved && <Icon name="bookmark" size={18} color={gold} />}
          </View>
          <Text
            style={[styles.slokaText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary, fontSize: scaledSizes.small }]}
            numberOfLines={2}
          >
            {slokaText}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const SlokaListScreen = ({ route, navigation }) => {
  const { chapter } = route.params;
  const { isDark } = useTheme();

  const [slokas, setSlokas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { scaledSizes } = useFontSize();
  const { language } = useLanguage();
  const t = useTranslation();

  // Pulse for loading Om (start/stop cleanly)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimRef = useRef(null);
  useEffect(() => {
    if (loading) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      );
      pulseAnimRef.current = anim;
      anim.start();
      return () => {
        anim.stop();
        pulseAnimRef.current = null;
      };
    }
    return undefined;
  }, [loading, pulseAnim]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadSlokas = React.useCallback(async () => {
    try {
      if (!isMounted.current) return;
      setLoading(true);
      const data = await fetchSlokasWithTranslations(chapter.chapter_number, language);
      if (isMounted.current) setSlokas(data || []);
    } catch (error) {
      console.error('Error loading slokas:', error);
      if (isMounted.current) setSlokas([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [chapter.chapter_number, language]);

  useEffect(() => {
    loadSlokas();
  }, [loadSlokas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSlokas();
    setRefreshing(false);
  };

  const navigateToDetail = (sloka) => {
    navigation.navigate('SlokaDetail', {
      chapterNumber: sloka.chapter_number,
      slokaNumber: sloka.verse_number,
    });
  };

  const localizedChapterName = getChapterName(chapter, language);
  const saffron = isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100');
  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const bg = isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC');

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Animated.Text style={[styles.omLoader, { color: gold, transform: [{ scale: pulseAnim }] }]}>
          ॐ
        </Animated.Text>
        <Text style={[styles.loadingText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary, fontSize: scaledSizes.base }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />

      {/* ── Decorative bg blob ── */}
      <View style={[styles.bgBlob, { backgroundColor: isDark ? 'rgba(255,215,0,0.02)' : 'rgba(200,137,42,0.05)' }]} />

      {/* ── Header ── */}
      <FadeIn delay={0}>
        <View style={styles.header}>
          <Text style={[styles.chapterTitle, { color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary, fontSize: scaledSizes.title }]}>
            {localizedChapterName}
          </Text>
          <Text style={[styles.chapterSubtitle, { color: saffron, fontSize: scaledSizes.large }]}>
            {chapter.name_sanskrit}
          </Text>
          <View style={[styles.headerLine, { backgroundColor: gold }]} />
        </View>
      </FadeIn>

      <FlatList
        data={slokas}
        keyExtractor={(item) => item.id.toString()}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        renderItem={({ item, index }) => (
          <AnimatedSlokaItem
            item={item}
            index={index}
            onPress={() => navigateToDetail(item)}
            isDark={isDark}
            scaledSizes={scaledSizes}
            language={language}
            t={t}
            chapterNumber={chapter.chapter_number}
          />
        )}
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
        // approximate item height for faster layout calculations
        getItemLayout={(data, index) => ({ length: 96, offset: 96 * index, index })}
        ListFooterComponent={
          <View style={styles.listFooter}>
            <Text style={[styles.listFooterText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>✦  ॐ  ✦</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    top: -width * 0.3,
    right: -width * 0.3,
    zIndex: 0,
  },
  centerContent: {
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
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  header: {
    padding: SPACING.large,
    paddingTop: SPACING.medium,
    alignItems: 'center',
  },
  chapterTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.xsmall,
  },
  chapterSubtitle: {
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  headerLine: {
    width: 60,
    height: 3,
    backgroundColor: '#C8892A', // Using gold directly for header accent
    borderRadius: 2,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.xlarge,
  },
  slokaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    marginVertical: SPACING.xsmall,
    borderWidth: 1,
    // Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  numberContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  slokaContent: {
    flex: 1,
    marginRight: SPACING.small,
  },
  verseTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  slokaText: {
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  listFooter: {
    alignItems: 'center',
    paddingVertical: SPACING.large,
  },
  listFooterText: {
    fontSize: 16,
    letterSpacing: 6,
  },
});

export default SlokaListScreen;

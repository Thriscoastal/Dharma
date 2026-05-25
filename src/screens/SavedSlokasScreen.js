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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useBookmarks } from '../context/BookmarkContext';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, COLORS } from '../constants/colors';
import { getSlokaText } from '../services/contentService';

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

// ─── SavedSlokaItem Component ───
const SavedSlokaItem = ({ item, index, onPress, onRemove, isDark, scaledSizes, language, t }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const delay = Math.min(index * 40, 400);
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const sloka = item.slokas;
  if (!sloka) return null;

  const slokaText = getSlokaText(sloka, sloka.translation, language);
  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={[
          {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
            borderColor: isDark ? COLORS.darkBorder : COLORS.border,
            shadowColor: isDark ? '#000' : gold,
            },
            itemStyles.slokaItem,
            ]}
            onPress={onPress}

        activeOpacity={0.8}
      >
        <View style={[itemStyles.numberContainer, { backgroundColor: gold }]}>
          <Text style={itemStyles.numberText}>{sloka.verse_number}</Text>
        </View>
        
        <View style={itemStyles.slokaContent}>
          <View style={itemStyles.slokaHeader}>
            <Text style={[itemStyles.verseTitle, { color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary, fontSize: scaledSizes.base }]}>
              {t('chapters.chapter')} {sloka.chapter_number}, {t('sloka.verse')} {sloka.verse_number}
            </Text>
            <TouchableOpacity onPress={onRemove} style={itemStyles.removeBtn}>
              <Icon name="bookmark" size={22} color={gold} />
            </TouchableOpacity>
          </View>
          
          <Text
            style={[itemStyles.slokaText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary, fontSize: scaledSizes.small }]}
            numberOfLines={2}
          >
            {slokaText}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Internal styles for the item component
const itemStyles = StyleSheet.create({
  slokaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    marginVertical: SPACING.xsmall,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  numberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  slokaContent: {
    flex: 1,
  },
  slokaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verseTitle: {
    fontWeight: '700',
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  slokaText: {
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

const SavedSlokasScreen = ({ navigation }) => {
  const { bookmarks, loading, toggleBookmark, refreshBookmarks } = useBookmarks();
  const { isDark } = useTheme();
  const { scaledSizes } = useFontSize();
  const { language } = useLanguage();
  const t = useTranslation();
  
  const [refreshing, setRefreshing] = useState(false);

  const styles = React.useMemo(() => getStyles(isDark), [isDark]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBookmarks();
    setRefreshing(false);
  };

  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const bg = isDark ? (COLORS.darkBackground || '#1A1A1A') : (COLORS.background || '#FDF6EC');

  if (loading && bookmarks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />
        <ActivityIndicator size="large" color={gold} />
        <Text style={[styles.loadingText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />

      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('common.savedVerses')}</Text>
        <View style={styles.pageTitleLine} />
      </View>

      {/* ── Decorative bg blob ── */}
      <View style={[styles.bgBlob, { backgroundColor: isDark ? 'rgba(255,215,0,0.02)' : 'rgba(200,137,42,0.05)' }]} />

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id?.toString() || `sloka_${item.sloka_id}`}
        renderItem={({ item, index }) => (
          <SavedSlokaItem
            item={item}
            index={index}
            onPress={() => navigation.navigate('ChaptersTab', { 
              screen: 'SlokaDetail',
              params: {
                chapterNumber: item.slokas.chapter_number, 
                slokaNumber: item.slokas.verse_number 
              }
            })}
            onRemove={() => toggleBookmark(item.slokas)}
            isDark={isDark}
            scaledSizes={scaledSizes}
            language={language}
            t={t}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={gold}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <FadeIn delay={200}>
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyOm, { color: gold }]}>ॐ</Text>
              <Text style={[styles.emptyText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>
                No saved verses yet.
              </Text>
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => navigation.navigate('ChaptersTab')}>
                <Text style={styles.browseBtnText}>Explore Chapters</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        }
        ListFooterComponent={
          bookmarks.length > 0 ? (
            <View style={styles.listFooter}>
              <Text style={[styles.listFooterText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>✦  ॐ  ✦</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.xlarge,
    minHeight: '100%',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyOm: {
    fontSize: 64,
    marginBottom: SPACING.medium,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
  },
  browseBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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

export default SavedSlokasScreen;

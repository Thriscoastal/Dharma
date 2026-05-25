import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SPACING } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const MainHeader = () => {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Close animation
      Animated.parallel([
        Animated.timing(menuAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMenuOpen(false);
      });
    } else {
      // Open animation
      setIsMenuOpen(true);
      Animated.parallel([
        Animated.timing(menuAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const navigateTo = (screenName, params = {}) => {
    // Immediate close toggle for better UX before navigation
    setIsMenuOpen(false);
    menuAnim.setValue(-width);
    overlayAnim.setValue(0);
    navigation.navigate(screenName, params);
  };

  const menuItems = [
    { name: t('nav.home'), icon: 'home', screen: 'HomeTab' },
    { name: t('nav.chapters'), icon: 'menu-book', screen: 'ChaptersTab', params: { screen: 'ChaptersList' } },
    { name: t('nav.geetAI'), icon: 'auto-awesome', screen: 'GeetAITab' },
    { name: t('nav.manomitra'), icon: 'psychology', screen: 'ManomitraTab' },
    { name: t('nav.saved'), icon: 'bookmark', screen: 'SavedSlokas' },
    { name: t('nav.settings'), icon: 'settings', screen: 'SettingsTab' },
  ];

  const gold = isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37');
  const saffron = isDark ? (COLORS.primaryLight || '#FF9800') : (COLORS.primary || '#E65100');

  // Common hitSlop for better touch targets
  const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 };

  return (
    <>
      <View style={[
        styles.headerWrapper, 
        { 
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
          paddingTop: insets.top,
          height: insets.top + 56,
        }
      ]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={toggleMenu} 
            style={styles.iconButton} 
            activeOpacity={0.7}
            hitSlop={hitSlop}
          >
            <Icon name="menu" size={28} color={gold} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: saffron }]}>
            {t('settings.appName')}
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('SettingsTab')} 
            style={styles.iconButton}
            activeOpacity={0.7}
            hitSlop={hitSlop}
          >
            <Icon name="settings" size={26} color={gold} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <View style={StyleSheet.absoluteFill}>
          {/* Slide Menu Overlay */}
          <Pressable 
            style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]} 
            onPress={toggleMenu}
          >
            <Animated.View 
              style={[
                styles.overlay, 
                { opacity: overlayAnim }
              ]} 
            />
          </Pressable>

          {/* Slide Menu Drawer */}
          <Animated.View 
            style={[
              styles.drawer, 
              { 
                transform: [{ translateX: menuAnim }],
                backgroundColor: isDark ? COLORS.darkBackground : COLORS.background 
              }
            ]}
          >
            <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
              <View style={styles.drawerHeader}>
                <View style={[styles.drawerLogoContainer, { backgroundColor: isDark ? 'rgba(230, 81, 0, 0.1)' : 'rgba(230, 81, 0, 0.05)' }]}>
                   <Text style={[styles.drawerLogo, { color: saffron }]}>ॐ</Text>
                </View>
                <Text style={[styles.drawerTitle, { color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary }]}>
                  {t('settings.appName')}
                </Text>
                <Text style={[styles.drawerSubtitle, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>
                  {t('settings.appSubtitle')}
                </Text>
              </View>

              <ScrollView style={styles.drawerScroll} bounces={false}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      { borderBottomColor: isDark ? COLORS.darkBorder : COLORS.border }
                    ]}
                    onPress={() => navigateTo(item.screen, item.params)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.08)' }]}>
                      <Icon name={item.icon} size={22} color={gold} />
                    </View>
                    <Text style={[styles.menuItemText, { color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Icon name="chevron-right" size={20} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                 <Text style={[styles.footerText, { color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary }]}>
                   ✦  ॐ  ✦
                 </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: height,
    zIndex: 100,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: SPACING.xlarge,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  drawerLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  drawerLogo: {
    fontSize: 32,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  drawerSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  drawerScroll: {
    flex: 1,
    paddingVertical: SPACING.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    letterSpacing: 4,
    opacity: 0.6,
  },
});

export default MainHeader;

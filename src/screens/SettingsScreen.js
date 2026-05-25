import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getNotificationEnabled,
  saveNotificationEnabled,
  getNotificationTime,
  saveNotificationTime,
} from '../services/storageService';
import {
  scheduleNotification,
  cancelNotifications,
  requestNotificationPermission,
  createNotificationChannel,
} from '../services/notificationService';
import { MIN_FONT_SIZE, MAX_FONT_SIZE } from '../services/fontSizeService';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import TimePicker from '../components/TimePicker';
import { COLORS, RADIUS, SPACING } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SettingsScreen = () => {
  const { isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  
  const { fontSize, updateFontSize, scaledSizes } = useFontSize();
  const { language, changeLanguage } = useLanguage();
  const t = useTranslation();

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes, fontSize]);

  useEffect(() => {
    loadSettings();
    initNotifications();
  }, []);

  const initNotifications = async () => {
    await requestNotificationPermission();
    await createNotificationChannel();
  };

  const loadSettings = async () => {
    const [notifEnabled, notifTime] = await Promise.all([
      getNotificationEnabled(),
      getNotificationTime(),
    ]);
    if (notifEnabled !== null) setNotificationsEnabled(notifEnabled);
    if (notifTime) setNotificationTime(notifTime);
  };

  const handleThemeToggle = async () => {
    await toggleTheme();
  };

  const handleLanguageChange = async (newLanguage) => {
    await changeLanguage(newLanguage);
    setShowLanguagePicker(false);
  };

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    await saveNotificationEnabled(value);

    if (value) {
      const [hour, minute] = notificationTime.split(':');
      await scheduleNotification(parseInt(hour), parseInt(minute));
    } else {
      await cancelNotifications();
    }
  };

  const handleTimeChange = async (time) => {
    setNotificationTime(time);
    await saveNotificationTime(time);
    setShowTimePicker(false);

    if (notificationsEnabled) {
      const [hour, minute] = time.split(':');
      await scheduleNotification(parseInt(hour), parseInt(minute));
    }
  };

  const handleFontSizeChange = async (newSize) => {
    const size = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
    await updateFontSize(size);
  };

  const languages = [
    { code: 'en', label: t('languages.en') },
    { code: 'hi', label: t('languages.hi') },
    { code: 'te', label: t('languages.te') },
    { code: 'ta', label: t('languages.ta') },
    { code: 'kn', label: t('languages.kn') },
    { code: 'ml', label: t('languages.ml') },
  ];

  const currentLanguageLabel = languages.find(l => l.code === language)?.label || t(`languages.${language}`);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      
      {/* Font Size Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="format-size" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t('settings.fontSize')}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.fontSizeControls}>
            <TouchableOpacity
              style={[styles.fontButton, fontSize <= MIN_FONT_SIZE && styles.fontButtonDisabled]}
              onPress={() => handleFontSizeChange(fontSize - 1)}
              disabled={fontSize <= MIN_FONT_SIZE}
              activeOpacity={0.7}>
              <Icon name="remove" size={24} color={fontSize <= MIN_FONT_SIZE ? (isDark ? '#555' : '#CCC') : '#FFF'} />
            </TouchableOpacity>
            
            <View style={styles.fontSizeDisplay}>
              <Text style={styles.fontSizeValue}>{fontSize}</Text>
              <Text style={styles.fontSizeUnit}>pt</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.fontButton, fontSize >= MAX_FONT_SIZE && styles.fontButtonDisabled]}
              onPress={() => handleFontSizeChange(fontSize + 1)}
              disabled={fontSize >= MAX_FONT_SIZE}
              activeOpacity={0.7}>
              <Icon name="add" size={24} color={fontSize >= MAX_FONT_SIZE ? (isDark ? '#555' : '#CCC') : '#FFF'} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDescription}>
            {t('settings.fontSizeHint')}
          </Text>
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="language" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.dropdownTrigger}
          onPress={() => setShowLanguagePicker(true)}
          activeOpacity={0.7}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownValue}>{currentLanguageLabel}</Text>
            <Icon name="arrow-drop-down" size={28} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.dailyReminder')}</Text>
              <Text style={styles.settingSubLabel}>
                {t('settings.dailyReminderDesc')}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: isDark ? '#444' : '#DDD', true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : (isDark ? '#888' : '#AAA')}
            />
          </View>

          {notificationsEnabled && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}>
              <Icon name="schedule" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.actionButtonText}>
                {t('settings.reminderAt')} {notificationTime}
              </Text>
              <Icon name="chevron-right" size={20} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="palette" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
              <Text style={styles.settingSubLabel}>
                {t('settings.darkModeDesc')}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: isDark ? '#444' : '#DDD', true: COLORS.primaryLight }}
              thumbColor={isDark ? COLORS.primary : (isDark ? '#888' : '#AAA')}
            />
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="info" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        </View>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>{t('settings.appName')}</Text>
          <Text style={styles.aboutTagline}>{t('settings.appSubtitle')}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>{t('settings.version')} 1.0.0</Text>
          </View>
          <Text style={styles.aboutText}>
            {t('settings.appDescription')}
          </Text>
        </View>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLanguagePicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Icon name="close" size={24} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    language === item.code && styles.modalOptionActive
                  ]}
                  onPress={() => handleLanguageChange(item.code)}>
                  <Text style={[
                    styles.modalOptionText,
                    language === item.code && styles.modalOptionTextActive
                  ]}>
                    {item.label}
                  </Text>
                  {language === item.code && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      <TimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={handleTimeChange}
        initialTime={notificationTime}
        isDark={isDark}
        scaledSizes={scaledSizes}
      />
    </ScrollView>
  );
};

const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
    },
    scrollContent: {
      paddingBottom: SPACING.xlarge,
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
    section: {
      marginTop: SPACING.large,
      marginHorizontal: SPACING.medium,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.small,
      paddingLeft: 4,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    card: {
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
      borderRadius: RADIUS.card,
      padding: SPACING.medium,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    fontSizeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.medium,
      marginBottom: SPACING.medium,
    },
    fontButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    fontButtonDisabled: {
      backgroundColor: isDark ? COLORS.darkSurface : '#F0F0F0',
      elevation: 0,
      shadowOpacity: 0,
    },
    fontSizeDisplay: {
      alignItems: 'center',
      minWidth: 60,
    },
    fontSizeValue: {
      fontSize: 32,
      fontWeight: '900',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    fontSizeUnit: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.primary,
      textTransform: 'uppercase',
      marginTop: -4,
    },
    cardDescription: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: scaledSizes.small * 1.5,
    },
    dropdownTrigger: {
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
      borderRadius: RADIUS.card,
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium - 2,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    dropdownContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownValue: {
      fontSize: scaledSizes.base,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flex: 1,
      marginRight: SPACING.medium,
    },
    settingLabel: {
      fontSize: scaledSizes.base,
      fontWeight: '700',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: 2,
    },
    settingSubLabel: {
      fontSize: scaledSizes.small,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      lineHeight: scaledSizes.small * 1.4,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(230, 81, 0, 0.08)' : 'rgba(230, 81, 0, 0.05)',
      borderRadius: RADIUS.large,
      padding: SPACING.medium,
      marginTop: SPACING.medium,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(230, 81, 0, 0.2)' : 'rgba(230, 81, 0, 0.1)',
    },
    actionButtonText: {
      flex: 1,
      fontSize: scaledSizes.base,
      fontWeight: '600',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    aboutCard: {
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface,
      borderRadius: RADIUS.card,
      padding: SPACING.large,
      borderWidth: 1,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      alignItems: 'center',
    },
    aboutName: {
      fontSize: 22,
      fontWeight: '900',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      marginBottom: 2,
    },
    aboutTagline: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.primary,
      fontStyle: 'italic',
      marginBottom: SPACING.medium,
    },
    versionBadge: {
      backgroundColor: isDark ? '#444' : '#F5F5F5',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: RADIUS.chip,
      marginBottom: SPACING.medium,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
    },
    aboutText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: SPACING.large,
      maxHeight: height * 0.7,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.large,
      paddingBottom: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.medium,
      paddingHorizontal: SPACING.small,
      borderRadius: RADIUS.medium,
      marginBottom: 4,
    },
    modalOptionActive: {
      backgroundColor: isDark ? 'rgba(230, 81, 0, 0.1)' : 'rgba(230, 81, 0, 0.05)',
    },
    modalOptionText: {
      fontSize: 17,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      fontWeight: '500',
    },
    modalOptionTextActive: {
      color: COLORS.primary,
      fontWeight: '700',
    },
  });

export default SettingsScreen;

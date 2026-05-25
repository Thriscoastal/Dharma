import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';
import { COLORS, RADIUS, SPACING } from '../constants/colors';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../context/ThemeContext';
import { useFontSize } from '../context/FontSizeContext';
import { useLanguage } from '../context/LanguageContext';
import { generateMeaningAudio, stopMeaningAudio } from '../services/ttsService';

const { width } = Dimensions.get('window');

// ─── Decorative Om Symbol ─────────────────────────────────────────────────
const OmDecor = ({ color, size = 28 }) => (
  <Text style={{ fontSize: size, color, fontWeight: '300', lineHeight: size * 1.2 }}>ॐ</Text>
);

// ─── Animated Fade-In Wrapper ─────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

const ManomitraScreen = () => {
  const { isDark, theme } = useTheme();
  const { scaledSizes } = useFontSize();
  const { language } = useLanguage();
  const t = useTranslation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState(null);
  const flatListRef = useRef(null);
  const soundRef = useRef(null);

  const styles = React.useMemo(() => getStyles(isDark, scaledSizes, theme), [isDark, scaledSizes, theme]);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: '1',
        text: t('manomitra.welcomeMessage'),
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    
    return () => {
      stopMeaningAudio();
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, [t]);

  const sendMessage = async (messageText) => {
    const text = (messageText || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) {
      setInputText('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://backfire-such-variable.ngrok-free.dev/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const botReply = data.reply || data.response || data.message || t('manomitra.botFallback');
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot API Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: t('manomitra.error'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async (messageId, text) => {
    if (isSpeakingId === messageId) {
      stopMeaningAudio();
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
      setIsSpeakingId(null);
      return;
    }

    try {
      // Stop any current speaking
      stopMeaningAudio();
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }

      setIsSpeakingId(messageId);
      const audioPath = await generateMeaningAudio(text, language);
      
      soundRef.current = new Sound(audioPath, null, (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          setIsSpeakingId(null);
          return;
        }
        soundRef.current.play((success) => {
          setIsSpeakingId(null);
          if (soundRef.current) {
            soundRef.current.release();
            soundRef.current = null;
          }
        });
      });
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeakingId(null);
    }
  };

  const renderMessage = ({ item }) => (
    <FadeIn style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
    ]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>ॐ</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, item.isUser && styles.userTimestamp]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!item.isUser && (
            <TouchableOpacity 
              onPress={() => handleTTS(item.id, item.text)}
              style={styles.ttsButton}
              activeOpacity={0.7}
            >
              <Icon 
                name={isSpeakingId === item.id ? "stop" : "volume-up"} 
                size={18} 
                color={isSpeakingId === item.id ? theme.primary : theme.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </FadeIn>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.bg} 
      />
      
      {/* Decorative Background Blob */}
      <View style={styles.bgBlob} />

      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('manomitra.title')}</Text>
        <View style={styles.pageTitleLine} />
        <Text style={styles.headerSubtitle} numberOfLines={1}>{t('manomitra.subtitle')}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.disclaimerContainer}>
            <Icon name="info-outline" size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.disclaimer}>{t('manomitra.disclaimer')}</Text>
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.loadingText}>...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('manomitra.placeholder')}
            placeholderTextColor={isDark ? 'rgba(240, 234, 214, 0.5)' : 'rgba(107, 87, 68, 0.5)'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            editable={!isLoading}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Icon name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDark, scaledSizes, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    bgBlob: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
      backgroundColor: isDark ? 'rgba(255, 215, 0, 0.02)' : 'rgba(230, 81, 0, 0.03)',
      top: -width * 0.2,
      right: -width * 0.3,
    },
    pageHeader: {
      paddingHorizontal: SPACING.medium,
      paddingTop: SPACING.medium,
      paddingBottom: SPACING.small,
      backgroundColor: theme.bg,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.textPrimary,
      letterSpacing: 0.5,
    },
    pageTitleLine: {
      width: 40,
      height: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 2,
      marginTop: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    disclaimerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.small,
      backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
      borderRadius: RADIUS.small,
      marginHorizontal: SPACING.medium,
      marginTop: SPACING.small,
    },
    disclaimer: {
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    messagesList: {
      padding: SPACING.medium,
      paddingBottom: SPACING.xlarge,
    },
    messageContainer: {
      marginVertical: SPACING.small,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    userMessageContainer: {
      justifyContent: 'flex-end',
    },
    botMessageContainer: {
      justifyContent: 'flex-start',
    },
    botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.small,
      borderWidth: 1,
      borderColor: theme.border,
    },
    botAvatarText: {
      color: theme.accentGold,
      fontSize: 16,
      fontWeight: 'bold',
    },
    messageBubble: {
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.small + 4,
      borderRadius: RADIUS.large,
      maxWidth: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    userBubble: {
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: theme.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    messageText: {
      fontSize: 16,
      color: theme.textPrimary,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#FFFFFF',
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
      gap: 8,
    },
    timestamp: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    userTimestamp: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    ttsButton: {
      padding: 2,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.xlarge,
      paddingBottom: SPACING.small,
    },
    loadingText: {
      marginLeft: 8,
      color: theme.textSecondary,
      fontSize: 18,
    },
    inputContainer: {
      padding: SPACING.medium,
      paddingBottom: Platform.OS === 'ios' ? SPACING.xlarge : SPACING.medium,
      backgroundColor: theme.bg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.surface,
      borderRadius: 25,
      paddingHorizontal: SPACING.small,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    input: {
      flex: 1,
      paddingHorizontal: SPACING.medium,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.textPrimary,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 4,
    },
    sendButtonDisabled: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
  });

export default ManomitraScreen;

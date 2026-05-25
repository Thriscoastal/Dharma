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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SPACING } from '../constants/colors';
import { useFontSize } from '../context/FontSizeContext'; 
import { useTranslation } from '../hooks/useTranslation';

import { useTheme } from '../context/ThemeContext';

const API_URL = 'https://reenact-cache-removal.ngrok-free.dev/chat';

const GeetAIScreen = () => {
  const { isDark } = useTheme();
  const t = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: t('voice.emptyState'),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const { scaledSizes } = useFontSize(); 
  const styles = React.useMemo(() => getStyles(isDark, scaledSizes), [isDark, scaledSizes]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const krishnaMessage = {
        id: (Date.now() + 1).toString(),
        text: data.answer || data.response || t('common.error'),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, krishnaMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: t('common.error'),
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      Alert.alert(t('common.error'), t('common.retry'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.krishnaMessageContainer,
      ]}>
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Icon name="auto-awesome" size={scaledSizes.large} color={isDark ? COLORS.darkAccentGold : COLORS.accentGold} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.krishnaBubble,
          item.isError && styles.errorBubble,
        ]}>
        <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, item.isUser && styles.userTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.avatarContainer}>
          <Icon name="person" size={scaledSizes.large} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
        </View>
      )}
    </View>
  );

  const renderSuggestions = () => {
    const suggestions = [
      'What is the meaning of life?',
      'How can I find inner peace?',
      'What is dharma?',
      'How to overcome fear?',
    ];

    if (messages.length > 1) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>{t('voice.ask')}</Text>
        <View style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => {
                setInputText(suggestion);
              }}
              activeOpacity={0.7}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      
      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('voice.title')}</Text>
        <View style={styles.pageTitleLine} />
        <Text style={styles.headerSubtitle}>
          {isLoading ? t('common.loading') : t('voice.placeholder')}
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={renderSuggestions}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('voice.placeholder')}
          placeholderTextColor={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.7}>
          <Icon name="send" size={scaledSizes.large} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDark, scaledSizes) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
    },
    pageHeader: {
      paddingHorizontal: SPACING.medium,
      paddingTop: SPACING.large,
      paddingBottom: SPACING.small,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
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
    headerSubtitle: {
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginTop: SPACING.xsmall,
      fontStyle: 'italic',
    },
    messagesList: {
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      flexGrow: 1, // Ensure FlatList fills available space
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.medium, // Adjusted spacing
      alignItems: 'flex-end',
      maxWidth: '100%', // Ensure it doesn't overflow
    },
    userMessageContainer: {
      justifyContent: 'flex-end',
    },
    krishnaMessageContainer: {
      justifyContent: 'flex-start',
    },
    avatarContainer: {
      width: 40, // Larger avatar
      height: 40,
      borderRadius: RADIUS.large, // Fully rounded
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: SPACING.xsmall, // Adjusted spacing
      // Subtle Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    messageBubble: {
      maxWidth: '75%', // Allow more width for messages
      paddingVertical: SPACING.small, // Adjusted padding
      paddingHorizontal: SPACING.medium,
      borderRadius: RADIUS.large, // More rounded bubbles
      // Premium Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      // Additional styling for elegant look
      borderWidth: StyleSheet.hairlineWidth,
    },
    userBubble: {
      backgroundColor: COLORS.primaryLight, // Lighter primary for user for contrast
      borderTopRightRadius: RADIUS.small, // Tail effect
      borderColor: COLORS.primary,
    },
    krishnaBubble: {
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt, // Use surfaceAlt for Krishna
      borderTopLeftRadius: RADIUS.small, // Tail effect
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    errorBubble: {
      backgroundColor: isDark ? '#3E2723' : '#FFF9C4', // Thematic error background (Deep Brown / Light Yellow)
      borderColor: COLORS.primaryLight, // Thematic error border
      borderWidth: 2, // More pronounced error border
    },
    messageText: {
      fontSize: scaledSizes.base, // Use scaled size
      lineHeight: scaledSizes.base * 1.5,
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    userMessageText: {
      color: '#FFFFFF',
    },
    timestamp: {
      fontSize: scaledSizes.xsmall, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginTop: SPACING.xsmall,
      alignSelf: 'flex-end',
    },
    userTimestamp: {
      color: 'rgba(255, 255, 255, 0.8)', // Brighter timestamp for user
    },
    suggestionsContainer: {
      marginTop: SPACING.large, // Increased spacing
      marginBottom: SPACING.large,
      marginHorizontal: SPACING.medium,
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface, // Card background
      borderRadius: RADIUS.card,
      padding: SPACING.medium,
      // Premium Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    suggestionsTitle: {
      fontSize: scaledSizes.base, // Use scaled size
      fontWeight: '700',
      color: COLORS.primary, // Primary color for title
      marginBottom: SPACING.small,
      textAlign: 'center', // Center title
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    suggestionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', // Center chips
      gap: SPACING.small, // Gap between chips
    },
    suggestionChip: {
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt, // Subtle background for chips
      paddingVertical: SPACING.small,
      paddingHorizontal: SPACING.medium,
      borderRadius: RADIUS.button, // More rounded chips
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      // Subtle shadow for chips
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    suggestionText: {
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.small,
      backgroundColor: isDark ? COLORS.darkCard : COLORS.surface, // Thematic loading background
      marginHorizontal: SPACING.medium,
      marginBottom: SPACING.medium,
      borderRadius: RADIUS.medium, // More rounded loading card
      // Subtle Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    loadingText: {
      marginLeft: SPACING.small,
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: SPACING.small, // Adjusted padding
      paddingBottom: Platform.OS === 'ios' ? SPACING.large : SPACING.small, // Extra padding for iOS keyboard
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
      alignItems: 'flex-end',
      // Subtle top shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? (COLORS.darkSurfaceAlt || '#333333') : COLORS.surfaceAlt,
      borderRadius: RADIUS.large, // Fully rounded input
      paddingHorizontal: SPACING.medium, // Adjusted padding
      paddingVertical: SPACING.small,
      paddingTop: SPACING.small, // Ensure consistent top padding
      fontSize: scaledSizes.base, // Use scaled size
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
      maxHeight: 120, // Increased max height for multiline
      marginRight: SPACING.small,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      // Inner shadow for input
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sendButton: {
      width: 52, // Slightly larger button
      height: 52,
      borderRadius: RADIUS.large, // Fully rounded
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      // Premium Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    sendButtonDisabled: {
      backgroundColor: isDark ? COLORS.darkBorder : COLORS.border,
      elevation: 0,
      shadowOpacity: 0, // No shadow when disabled
    },
  });

export default GeetAIScreen;

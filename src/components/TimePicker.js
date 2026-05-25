import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SPACING } from '../constants/colors';

const { width } = Dimensions.get('window');

const TimePicker = ({ visible, onClose, onSelect, initialTime = '08:00', isDark, scaledSizes }) => {
  const [selectedHour, setSelectedHour] = useState(parseInt(initialTime.split(':')[0]));
  const [selectedMinute, setSelectedMinute] = useState(parseInt(initialTime.split(':')[1]));
  
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Safe fallback for scaledSizes
  const safeSizes = scaledSizes || {
    xsmall: 12,
    small: 14,
    base: 16,
    large: 18,
    heading: 22,
    title: 28,
    sanskrit: 20,
  };

  const styles = getStyles(isDark, safeSizes);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i); // All 60 minutes

  const handleConfirm = () => {
    const time = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(time);
    onClose();
  };

  const scrollToInitial = (type) => {
    const value = type === 'hour' ? selectedHour : selectedMinute;
    const ref = type === 'hour' ? hourScrollRef : minuteScrollRef;
    if (ref.current && value !== undefined) {
      const itemHeight = 40; // Approximate item height
      const offset = (value * itemHeight) - (180 / 2) + (itemHeight / 2);
      ref.current.scrollTo({ y: offset, animated: false });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Time</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={safeSizes.large} color={isDark ? COLORS.darkTextSecondary : COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Hour</Text>
              <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                onLayout={() => scrollToInitial('hour')}
                ref={hourScrollRef}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      selectedHour === hour && styles.timeOptionActive,
                    ]}
                    onPress={() => setSelectedHour(hour)}>
                    <Text
                      style={[
                        styles.timeText,
                        selectedHour === hour && styles.timeTextActive,
                      ]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Minute</Text>
              <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                onLayout={() => scrollToInitial('minute')}
                ref={minuteScrollRef}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeOption,
                      selectedMinute === minute && styles.timeOptionActive,
                    ]}
                    onPress={() => setSelectedMinute(minute)}>
                    <Text
                      style={[
                        styles.timeText,
                        selectedMinute === minute && styles.timeTextActive,
                      ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Selected Time:</Text>
            <Text style={styles.previewTime}>
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.7}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (isDark, scaledSizes) => // Added scaledSizes
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for better focus
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: width * 0.85, // Slightly wider
      maxWidth: 450, // Increased max width
      backgroundColor: isDark ? COLORS.darkBackground : COLORS.background, // Use background color
      borderRadius: RADIUS.card, // Consistent radius
      padding: SPACING.large, // Use new spacing
      // Premium Shadow
      elevation: 12,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 15,
      borderWidth: StyleSheet.hairlineWidth, // Subtle border
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.large, // Use new spacing
      borderBottomWidth: StyleSheet.hairlineWidth, // Subtle divider
      borderBottomColor: isDark ? COLORS.darkBorder : COLORS.border,
      paddingBottom: SPACING.small,
    },
    title: {
      fontSize: scaledSizes.large, // Use scaled size
      fontWeight: '700', // Bolder
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    closeButton: {
      padding: SPACING.xsmall, // Larger hit area
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.large, // Use new spacing
      backgroundColor: isDark ? COLORS.darkSurfaceAlt : COLORS.surfaceAlt, // Accent background for picker
      borderRadius: RADIUS.medium,
      paddingVertical: SPACING.small,
    },
    pickerColumn: {
      flex: 1,
      alignItems: 'center',
    },
    columnLabel: {
      fontSize: scaledSizes.small, // Use scaled size
      fontWeight: '700', // Bolder
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary, // Muted label
      marginBottom: SPACING.small, // Use new spacing
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    scrollView: {
      maxHeight: 180, // Slightly less height
      width: '100%',
      // Add subtle border to scroll view to define picker area
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      borderRadius: RADIUS.small,
    },
    timeOption: {
      paddingVertical: SPACING.small, // Use new spacing
      paddingHorizontal: SPACING.medium,
      marginVertical: SPACING.xsmall, // Use new spacing
      borderRadius: RADIUS.medium, // More rounded options
      backgroundColor: 'transparent', // Transparent by default
      alignItems: 'center',
    },
    timeOptionActive: {
      backgroundColor: COLORS.primary, // Primary color for active
    },
    timeText: {
      fontSize: scaledSizes.base, // Use scaled size
      fontWeight: '500',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    timeTextActive: {
      color: '#FFFFFF', // White text on active
      fontWeight: '700',
    },
    separator: {
      fontSize: scaledSizes.title, // Use scaled size for separator
      fontWeight: 'bold',
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary, // Muted separator
      marginHorizontal: SPACING.small, // Use new spacing
      marginTop: SPACING.large, // Align with picker content
    },
    previewContainer: {
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface, // Card background
      padding: SPACING.medium, // Use new spacing
      borderRadius: RADIUS.card, // Consistent radius
      alignItems: 'center',
      marginBottom: SPACING.large, // Use new spacing
      // Subtle Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
    },
    previewLabel: {
      fontSize: scaledSizes.small, // Use scaled size
      color: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
      marginBottom: SPACING.xsmall, // Use new spacing
    },
    previewTime: {
      fontSize: scaledSizes.title, // Use scaled size for preview
      fontWeight: 'bold',
      color: COLORS.primary, // Primary color for time
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.medium, // Use new spacing
    },
    cancelButton: {
      flex: 1,
      paddingVertical: SPACING.medium, // Use new spacing
      borderRadius: RADIUS.button,
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.surfaceAlt, // Thematic background
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.darkBorder : COLORS.border,
      // Subtle Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    cancelButtonText: {
      fontSize: scaledSizes.base, // Use scaled size
      fontWeight: '600',
      color: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
    },
    confirmButton: {
      flex: 1,
      paddingVertical: SPACING.medium, // Use new spacing
      borderRadius: RADIUS.button,
      backgroundColor: COLORS.primary, // Primary color background
      alignItems: 'center',
      // Premium Shadow
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
    confirmButtonText: {
      fontSize: scaledSizes.base, // Use scaled size
      fontWeight: '700', // Bolder
      color: '#FFFFFF',
    },
  });

export default TimePicker;

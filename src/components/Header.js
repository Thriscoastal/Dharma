import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../context/ThemeContext';

const Header = ({ title, onBackPress, rightIcon, onRightPress }) => {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {rightIcon && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
          <Icon name={rightIcon} size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
      elevation: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      flex: 1,
      textAlign: 'center',
    },
    iconButton: {
      padding: 8,
    },
  });

export default Header;

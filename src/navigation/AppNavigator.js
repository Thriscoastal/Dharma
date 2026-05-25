import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getTheme } from '../services/storageService';
import { COLORS } from '../constants/colors';
import { useTranslation } from '../hooks/useTranslation';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ChaptersScreen from '../screens/ChaptersScreen';
import SlokaListScreen from '../screens/SlokaListScreen';
import SlokaDetailScreen from '../screens/SlokaDetailScreen';
import SavedSlokasScreen from '../screens/SavedSlokasScreen';
import GeetAIScreen from '../screens/GeetAIScreen';
import ManomitraScreen from '../screens/ManomitraScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useTheme } from '../context/ThemeContext';
import MainHeader from '../components/MainHeader';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Chapters Stack Navigator
const ChaptersStack = () => {
  const t = useTranslation();
  const { isDark } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
        },
        headerTintColor: isDark ? COLORS.darkTextPrimary : COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="ChaptersList" 
        component={ChaptersScreen}
        options={{ 
          headerShown: false, // We use the Tab's MainHeader for this
        }} 
      />
      <Stack.Screen 
        name="SlokaList" 
        component={SlokaListScreen}
        options={{ title: t('common.verses') }} 
      />
      <Stack.Screen 
        name="SlokaDetail" 
        component={SlokaDetailScreen}
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

// Helper to determine if MainHeader should be shown for a tab route
const shouldShowMainHeader = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeTab';
  
  // If we are in ChaptersTab, only show MainHeader if we are at the root (ChaptersList)
  if (route.name === 'ChaptersTab') {
    return !routeName || routeName === 'ChaptersList';
  }
  
  // For other main tabs, we show it
  const mainTabs = ['HomeTab', 'GeetAITab', 'ManomitraTab', 'SettingsTab'];
  return mainTabs.includes(route.name);
};

// Main Tab Navigator
const TabNavigator = () => {
  const t = useTranslation();
  const { isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: shouldShowMainHeader(route),
        header: () => <MainHeader />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'ChaptersTab') {
            iconName = 'menu-book';
          } else if (route.name === 'GeetAITab') {
            iconName = 'auto-awesome';
          } else if (route.name === 'ManomitraTab') {
            iconName = 'psychology';
          } else if (route.name === 'SettingsTab') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
          borderTopColor: isDark ? COLORS.darkBorder : COLORS.border,
          borderTopWidth: 1,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          if (route.name === 'ChaptersTab') {
            e.preventDefault();
            navigation.navigate('ChaptersTab', { screen: 'ChaptersList' });
          }
        },
      })}>
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={() => ({ 
          title: t('nav.home'),
          tabBarLabel: t('nav.home')
        })} 
      />
      <Tab.Screen 
        name="ChaptersTab" 
        component={ChaptersStack} 
        options={() => ({ 
          tabBarLabel: t('nav.chapters')
        })} 
      />
      <Tab.Screen
        name="GeetAITab"
        component={GeetAIScreen}
        options={() => ({
          title: t('nav.geetAI'),
          tabBarLabel: t('nav.geetAI'),
        })}
      />
      <Tab.Screen
        name="ManomitraTab"
        component={ManomitraScreen}
        options={() => ({
          title: t('nav.manomitra'),
          tabBarLabel: t('nav.manomitra'),
        })}
      />
      <Tab.Screen 
        name="SettingsTab"
        component={SettingsScreen}
        options={() => ({ 
          title: t('nav.settings'),
          tabBarLabel: t('nav.settings')
        })} 
      />
      <Tab.Screen
        name="SavedSlokas"
        component={SavedSlokasScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: '', // Keep only the page title in content
          headerStyle: {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? COLORS.darkBorder : COLORS.border,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 16, padding: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon 
                name="arrow-back" 
                size={24} 
                color={isDark ? (COLORS.darkAccentGold || '#FFD700') : (COLORS.accentGold || '#D4AF37')} 
              />
            </TouchableOpacity>
          ),
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        })}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;

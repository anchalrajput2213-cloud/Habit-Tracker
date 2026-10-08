import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

export default function BottomNavBar() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      route: '/',
      icon: 'home',
      iconOutline: 'home-outline',
    },
    {
      name: 'Statistics',
      route: '/statistics',
      icon: 'stats-chart',
      iconOutline: 'stats-chart-outline',
    },
    {
      name: 'Settings',
      route: '/settings',
      icon: 'settings',
      iconOutline: 'settings-outline',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBg,
          borderColor: colors.navBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
        const iconName = (isActive ? tab.icon : tab.iconOutline) as keyof typeof Ionicons.glyphMap;

        return (
          <AnimatedPressable
            key={tab.name}
            style={[
              styles.tabItem,
              isActive && { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' },
            ]}
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route as any);
              }
            }}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.name}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
});

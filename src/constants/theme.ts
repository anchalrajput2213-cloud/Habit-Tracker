import { Platform } from 'react-native';

export const LightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  cardBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  shadow: 'rgba(15, 23, 42, 0.08)',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  iconBg: '#EEF2FF',
  chipBg: '#F1F5F9',
  chipActiveBg: '#4F46E5',
  chipActiveText: '#FFFFFF',
  headerBg: '#4F46E5',
  headerText: '#FFFFFF',
  cardBg: '#FFFFFF',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',
  // Legacy aliases
  text: '#0F172A',
  backgroundElement: '#F1F5F9',
  backgroundSelected: '#CBD5E1',
};

export const DarkColors = {
  background: '#0B0F19',
  surface: '#1E293B',
  surfaceSecondary: '#151E2E',
  cardBorder: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  accent: '#34D399',
  accentLight: 'rgba(52, 211, 153, 0.15)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  inputBg: '#0F172A',
  inputBorder: '#334155',
  iconBg: 'rgba(99, 102, 241, 0.2)',
  chipBg: '#1E293B',
  chipActiveBg: '#6366F1',
  chipActiveText: '#FFFFFF',
  headerBg: '#1E293B',
  headerText: '#F8FAFC',
  cardBg: '#1E293B',
  navBg: '#1E293B',
  navBorder: '#334155',
  // Legacy aliases
  text: '#F8FAFC',
  backgroundElement: '#1E293B',
  backgroundSelected: '#334155',
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

export type ThemeColor = keyof typeof LightColors & keyof typeof DarkColors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

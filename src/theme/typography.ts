import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 38,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
} as const;

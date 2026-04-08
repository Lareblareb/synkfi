import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

type BadgeVariant = 'lime' | 'dark' | 'outline';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'lime' }) => {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, textStyles[variant]]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  lime: {
    backgroundColor: colors.accent.lime,
  },
  dark: {
    backgroundColor: colors.bg.elevated,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});

const textStyles = StyleSheet.create({
  lime: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.black,
  },
  dark: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  outline: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

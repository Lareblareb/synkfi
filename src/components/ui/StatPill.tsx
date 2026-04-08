import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface StatPillProps {
  value: string | number;
  label: string;
}

export const StatPill: React.FC<StatPillProps> = ({ value, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  value: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent.lime,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface BrandPillarCardProps {
  emoji: string;
  title: string;
  description: string;
}

export const BrandPillarCard: React.FC<BrandPillarCardProps> = ({
  emoji,
  title,
  description,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

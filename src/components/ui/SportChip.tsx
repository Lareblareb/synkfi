import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { SportType } from '../../types/database.types';
import { SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';

interface SportChipProps {
  sport: SportType;
  selected?: boolean;
  onPress?: () => void;
}

export const SportChip: React.FC<SportChipProps> = ({
  sport,
  selected = false,
  onPress,
}) => {
  const emoji = SPORT_EMOJI[sport];
  const label = SPORT_LABELS[sport];

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  selected: {
    backgroundColor: colors.accent.lime,
    borderColor: colors.accent.lime,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectedLabel: {
    color: colors.black,
  },
});

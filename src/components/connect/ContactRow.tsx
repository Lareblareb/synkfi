import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface ContactRowProps {
  icon: string;
  value: string;
  onPress?: () => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({
  icon,
  value,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
});

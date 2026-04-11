import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { EventParticipant } from '../../types/event.types';
import { Avatar } from '../ui/Avatar';

interface ParticipantListProps {
  participants: EventParticipant[];
  max?: number;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  max = 8,
}) => {
  const safeParticipants = participants ?? [];
  const visible = safeParticipants.slice(0, max);
  const overflow = safeParticipants.length - max;

  return (
    <View style={styles.grid}>
      {visible.map((participant) => (
        <View key={participant.id} style={styles.item}>
          <Avatar
            uri={participant.avatar_url}
            name={participant.name ?? ''}
            size="lg"
          />
          <Text style={styles.name} numberOfLines={1}>
            {(participant.name ?? '').split(' ')[0]}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={styles.item}>
          <View style={styles.overflowCircle}>
            <Text style={styles.overflowText}>+{overflow}</Text>
          </View>
          <Text style={styles.name}>
            {/* intentionally blank for alignment */}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 56,
  },
  name: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  overflowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});

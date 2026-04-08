import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { PublicProfile } from '../../types/user.types';
import { SPORT_LABELS } from '../../types/event.types';
import { Avatar } from '../ui/Avatar';

interface MemberCardProps {
  member: PublicProfile;
  onPress: () => void;
  onConnect: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onPress,
  onConnect,
}) => {
  const { t } = useTranslation();

  const primarySport =
    member.sports.length > 0
      ? SPORT_LABELS[member.sports[0]] ?? member.sports[0]
      : '';

  const isConnected = member.connection_status === 'accepted';
  const isPending = member.connection_status === 'pending_sent';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarSection}>
        <Avatar uri={member.avatar_url} name={member.name} size="xl" />
      </View>

      <Text style={styles.name}>{member.name}</Text>

      <Text style={styles.subtitle}>
        {primarySport}
        {primarySport && member.location_name ? ' \u00B7 ' : ''}
        {member.location_name}
      </Text>

      {member.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {member.bio}
        </Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{member.events_joined_count}</Text>
          <Text style={styles.statLabel}>
            {t('connect:events', { defaultValue: 'Events' })}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{member.connections_count}</Text>
          <Text style={styles.statLabel}>
            {t('connect:connections', { defaultValue: 'Connections' })}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isConnected && styles.actionButtonConnected,
            isPending && styles.actionButtonPending,
          ]}
          onPress={onConnect}
          disabled={isConnected || isPending}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionButtonText,
              isConnected && styles.actionButtonTextConnected,
              isPending && styles.actionButtonTextPending,
            ]}
          >
            {isConnected
              ? t('connect:connected', { defaultValue: 'Connected' })
              : isPending
                ? t('connect:pending', { defaultValue: 'Pending' })
                : t('connect:connect', { defaultValue: 'Connect' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.messageButtonText}>
            {t('connect:viewProfile', { defaultValue: 'View Profile' })}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  avatarSection: {
    marginBottom: spacing.base,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bio: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.base,
    gap: spacing['2xl'],
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.base,
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.accent.lime,
    borderRadius: borderRadius.input,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonConnected: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionButtonPending: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.black,
  },
  actionButtonTextConnected: {
    color: colors.text.muted,
  },
  actionButtonTextPending: {
    color: colors.accent.lime,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.input,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
});

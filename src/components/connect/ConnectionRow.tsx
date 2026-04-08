import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { ConnectionWithUser } from '../../types/connection.types';
import { Avatar } from '../ui/Avatar';

interface ConnectionRowProps {
  connection: ConnectionWithUser;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConnectionRow: React.FC<ConnectionRowProps> = ({
  connection,
  onAccept,
  onDecline,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Avatar
        uri={connection.user.avatar_url}
        name={connection.user.name}
        size="lg"
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {connection.user.name}
        </Text>
        {connection.user.location_name ? (
          <Text style={styles.location} numberOfLines={1}>
            {connection.user.location_name}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptText}>
            {t('connect:accept', { defaultValue: 'Accept' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineButton}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text style={styles.declineText}>
            {t('connect:decline', { defaultValue: 'Decline' })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  location: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: colors.accent.lime,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  acceptText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '700',
  },
  declineButton: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  declineText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});

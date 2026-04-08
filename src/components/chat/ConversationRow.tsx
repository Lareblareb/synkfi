import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Conversation } from '../../types/chat.types';
import { formatRelativeTime, truncate } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  onPress,
}) => {
  const displayName = conversation.is_direct
    ? conversation.other_user?.name ?? ''
    : conversation.event_title ?? '';

  const avatarName = conversation.is_direct
    ? conversation.other_user?.name ?? '?'
    : conversation.event_title ?? '?';

  const avatarUri = conversation.is_direct
    ? conversation.other_user?.avatar_url ?? null
    : null;

  const hasUnread = conversation.unread_count > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar uri={avatarUri} name={avatarName} size="lg" />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, hasUnread && styles.nameBold]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text style={styles.time}>
            {formatRelativeTime(conversation.last_message_at)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.preview,
              hasUnread && styles.previewUnread,
            ]}
            numberOfLines={1}
          >
            {truncate(conversation.last_message, 50)}
          </Text>

          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unread_count > 99
                  ? '99+'
                  : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  nameBold: {
    fontWeight: '700',
  },
  time: {
    ...typography.caption,
    color: colors.text.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    ...typography.bodySmall,
    color: colors.text.muted,
    flex: 1,
    marginRight: spacing.sm,
  },
  previewUnread: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.accent.lime,
    borderRadius: borderRadius.pill,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  unreadText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '700',
    fontSize: 11,
  },
});

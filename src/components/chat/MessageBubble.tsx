import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { ChatMessage } from '../../types/chat.types';
import { formatChatTime } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false,
  showName = false,
}) => {
  return (
    <View
      style={[
        styles.row,
        isOwn ? styles.rowOwn : styles.rowOther,
      ]}
    >
      {!isOwn && showAvatar && (
        <View style={styles.avatarWrapper}>
          <Avatar
            uri={message.sender.avatar_url}
            name={message.sender.name}
            size="sm"
          />
        </View>
      )}
      {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}

      <View style={styles.content}>
        {!isOwn && showName && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {message.message}
          </Text>
        </View>
        <Text
          style={[
            styles.time,
            isOwn ? styles.timeOwn : styles.timeOther,
          ]}
        >
          {formatChatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.base,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatarWrapper: {
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  avatarSpacer: {
    width: 32 + spacing.sm,
  },
  content: {
    maxWidth: '75%',
  },
  senderName: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  bubble: {
    borderRadius: borderRadius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleOwn: {
    backgroundColor: colors.accent.lime,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleOther: {
    backgroundColor: colors.bg.surface,
    borderBottomLeftRadius: spacing.xs,
  },
  messageText: {
    ...typography.body,
  },
  messageTextOwn: {
    color: colors.black,
  },
  messageTextOther: {
    color: colors.text.primary,
  },
  time: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  timeOwn: {
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  timeOther: {
    textAlign: 'left',
    marginLeft: spacing.xs,
  },
});

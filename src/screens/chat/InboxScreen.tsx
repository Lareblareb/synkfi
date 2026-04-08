import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useChat } from '../../hooks/useChat';
import { Conversation } from '../../types/chat.types';
import { formatRelativeTime, getInitial, truncate } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const InboxScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('chat');
  const { conversations, isLoading, refresh } = useChat();

  const handlePress = (conv: Conversation) => {
    if (conv.is_direct && conv.other_user) {
      navigation.navigate('DirectMessage', { userId: conv.other_user.id, userName: conv.other_user.name });
    } else if (conv.event_id) {
      navigation.navigate('GroupChat', { eventId: conv.event_id, eventTitle: conv.event_title ?? '' });
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const name = item.is_direct ? item.other_user?.name ?? '' : item.event_title ?? '';
    const avatarUrl = item.is_direct ? item.other_user?.avatar_url : null;
    return (
      <TouchableOpacity style={styles.row} onPress={() => handlePress(item)} activeOpacity={0.8}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(name) }]}>
            <Text style={styles.avatarInitial}>{getInitial(name)}</Text>
          </View>
        )}
        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
            {item.last_message_at && <Text style={styles.rowTime}>{formatRelativeTime(item.last_message_at)}</Text>}
          </View>
          <View style={styles.rowFooter}>
            <Text style={styles.rowMessage} numberOfLines={1}>{truncate(item.last_message, 40)}</Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread_count}</Text></View>
            )}
          </View>
          {!item.is_direct && <Text style={styles.participantLabel}>{t('participants', { count: item.participant_count })}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('inbox')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>{t('noConversations')}</Text>
            <Text style={styles.emptyHint}>{t('noConversationsHint')}</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent.lime} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: colors.bg.primary, fontSize: 20, fontWeight: '700' },
  rowContent: { flex: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  rowName: { color: colors.text.primary, fontSize: 16, fontWeight: '600', flex: 1 },
  rowTime: { color: colors.text.muted, fontSize: 12 },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowMessage: { color: colors.text.secondary, fontSize: 14, flex: 1 },
  unreadBadge: { backgroundColor: colors.accent.lime, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: colors.bg.primary, fontSize: 11, fontWeight: '700' },
  participantLabel: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});

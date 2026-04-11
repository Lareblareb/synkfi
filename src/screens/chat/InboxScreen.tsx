import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useChat } from '../../hooks/useChat';
import { useConnectionsStore } from '../../store/connections';
import { useAuthStore } from '../../store/auth';
import { Conversation } from '../../types/chat.types';
import { ConnectionWithUser } from '../../types/connection.types';
import { formatRelativeTime, getInitial, truncate } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

type Tab = 'messages' | 'requests';

export const InboxScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('chat');
  const user = useAuthStore((s) => s.user);
  const { conversations, isLoading, refresh } = useChat();
  const pendingRequests = useConnectionsStore((s) => s.pendingRequests);
  const fetchPendingRequests = useConnectionsStore((s) => s.fetchPendingRequests);
  const respondToConnection = useConnectionsStore((s) => s.respondToConnection);
  const [activeTab, setActiveTab] = useState<Tab>('messages');

  const loadRequests = useCallback(() => {
    if (user) fetchPendingRequests(user.id);
  }, [user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadRequests();
    }, [refresh, loadRequests])
  );

  const handlePress = (conv: Conversation) => {
    if (conv.is_direct && conv.other_user) {
      navigation.navigate('DirectMessage', {
        userId: conv.other_user.id,
        userName: conv.other_user.name,
      });
    } else if (conv.event_id) {
      navigation.navigate('GroupChat', {
        eventId: conv.event_id,
        eventTitle: conv.event_title ?? '',
      });
    }
  };

  const handleAccept = async (connId: string) => {
    await respondToConnection(connId, 'accepted');
    loadRequests();
  };

  const handleDecline = async (connId: string) => {
    await respondToConnection(connId, 'declined');
    loadRequests();
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
            <Text style={styles.rowName} numberOfLines={1}>
              {name}
            </Text>
            {item.last_message_at && (
              <Text style={styles.rowTime}>{formatRelativeTime(item.last_message_at)}</Text>
            )}
          </View>
          <View style={styles.rowFooter}>
            <Text style={styles.rowMessage} numberOfLines={1}>
              {truncate(item.last_message ?? '', 40)}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
          {!item.is_direct && (
            <Text style={styles.participantLabel}>
              {t('participants', { count: item.participant_count })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequest = ({ item }: { item: ConnectionWithUser }) => {
    const reqUser = item.user;
    if (!reqUser) return null;
    return (
      <View style={styles.requestRow}>
        <TouchableOpacity
          style={styles.requestLeft}
          onPress={() => navigation.navigate('PublicProfile', { userId: reqUser.id })}
        >
          {reqUser.avatar_url ? (
            <Image source={{ uri: reqUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(reqUser.name) }]}>
              <Text style={styles.avatarInitial}>{getInitial(reqUser.name)}</Text>
            </View>
          )}
          <View style={styles.requestInfo}>
            <Text style={styles.requestName} numberOfLines={1}>{reqUser.name}</Text>
            <Text style={styles.requestHint} numberOfLines={1}>
              wants to connect with you
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleDecline(item.id)}
          >
            <Ionicons name="close" size={20} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
          >
            <Ionicons name="checkmark" size={20} color={colors.bg.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyMessages = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>{t('noConversations')}</Text>
      <Text style={styles.emptyHint}>{t('noConversationsHint')}</Text>
    </View>
  );

  const renderEmptyRequests = () => (
    <View style={styles.emptyState}>
      <Ionicons name="person-add-outline" size={64} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>No pending requests</Text>
      <Text style={styles.emptyHint}>
        When someone sends you a connection request, it will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            Chats
          </Text>
          {conversations.filter((c) => c.unread_count > 0).length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {conversations.filter((c) => c.unread_count > 0).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'messages' ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmptyMessages : null}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent.lime} />
          }
        />
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyRequests}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadRequests} tintColor={colors.accent.lime} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  headerTitle: { ...typography.h1, color: colors.text.primary },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tabActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  tabText: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.bg.primary, fontWeight: '700' },
  tabBadge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: { color: colors.text.primary, fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] + 80 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: colors.bg.primary, fontSize: 20, fontWeight: '700' },
  rowContent: { flex: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  rowName: { color: colors.text.primary, fontSize: 16, fontWeight: '600', flex: 1 },
  rowTime: { color: colors.text.muted, fontSize: 12 },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowMessage: { color: colors.text.secondary, fontSize: 14, flex: 1 },
  unreadBadge: {
    backgroundColor: colors.accent.lime,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: colors.bg.primary, fontSize: 11, fontWeight: '700' },
  participantLabel: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  // Request styles
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  requestLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  requestInfo: { flex: 1 },
  requestName: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  requestHint: { color: colors.text.muted, fontSize: 13, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: spacing.sm },
  declineBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
  emptyHint: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});

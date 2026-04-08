import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';
import { NotificationRow } from '../../types/database.types';
import { formatRelativeTime } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const NOTIFICATION_ICONS: Record<string, string> = {
  event_join: 'people',
  event_update: 'calendar',
  event_cancel: 'close-circle',
  event_reminder: 'alarm',
  chat_message: 'chatbubble',
  chat_group: 'chatbubbles',
  payment_success: 'checkmark-circle',
  payment_failed: 'alert-circle',
  connection_request: 'person-add',
  connection_accepted: 'people',
  nearby_event: 'location',
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('notifications');
  const language = useSettingsStore((s) => s.language);
  const { notifications, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
  const user = useAuthStore((s) => s.user);

  const handlePress = (notification: NotificationRow) => {
    if (!notification.read) markAsRead(notification.id);
    const data = notification.data as Record<string, string> | null;
    if (data?.event_id) {
      navigation.navigate('EventDetail', { eventId: data.event_id });
    } else if (data?.user_id) {
      navigation.navigate('PublicProfile', { userId: data.user_id });
    }
  };

  const renderNotification = ({ item }: { item: NotificationRow }) => {
    const title = language === 'fi' ? item.title_fi : item.title_en;
    const body = language === 'fi' ? item.body_fi : item.body_en;
    const iconName = NOTIFICATION_ICONS[item.type] || 'notifications';

    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.read && styles.notifUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
          <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={20} color={item.read ? colors.text.muted : colors.accent.lime} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>{body}</Text>
          <Text style={styles.notifTime}>{formatRelativeTime(item.created_at)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <TouchableOpacity onPress={() => user && markAllAsRead(user.id)}>
          <Text style={styles.markAllRead}>{t('markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>{t('empty')}</Text>
            <Text style={styles.emptyHint}>{t('emptyHint')}</Text>
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
  markAllRead: { color: colors.accent.lime, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  notifUnread: { backgroundColor: 'rgba(197,241,53,0.03)' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center' },
  iconCircleUnread: { backgroundColor: 'rgba(197,241,53,0.1)' },
  notifContent: { flex: 1 },
  notifTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  notifBody: { color: colors.text.secondary, fontSize: 13, lineHeight: 18 },
  notifTime: { color: colors.text.muted, fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.lime, marginTop: 6 },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});

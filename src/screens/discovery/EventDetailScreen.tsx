import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEventsStore } from '../../store/events';
import { useAuthStore } from '../../store/auth';
import { eventsService } from '../../services/events';
import { SPORT_EMOJI } from '../../types/event.types';
import { formatDateTime, formatCurrency, getInitial } from '../../utils/formatters';
import { calculateCostPerPerson } from '../../utils/costSplitter';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const { t } = useTranslation(['events', 'common']);
  const user = useAuthStore((s) => s.user);
  const { currentEvent: event, fetchEventById, joinEvent, leaveEvent, cancelEvent, isLoading } = useEventsStore();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEventById(route.params.eventId, user.id);
    }
  }, [route.params.eventId]);

  useEffect(() => {
    if (!event) return;
    const channel = eventsService.subscribeToEvent(event.id, () => {
      if (user) fetchEventById(event.id, user.id);
    });
    return () => { channel.unsubscribe(); };
  }, [event?.id]);

  const handleJoin = () => {
    if (!event || !user) return;
    if (event.venue_cost > 0) {
      navigation.navigate('PaymentConfirm', { eventId: event.id, amount: event.cost_per_person });
    } else {
      Alert.alert(t('events:detail.confirmJoin'), t('events:detail.confirmJoinMessage'), [
        { text: t('common:cancel'), style: 'cancel' },
        { text: t('common:confirm'), onPress: async () => {
          setActionLoading(true);
          try { await joinEvent(event.id, user.id); } catch { /* handled */ }
          setActionLoading(false);
        }},
      ]);
    }
  };

  const handleLeave = () => {
    if (!event || !user) return;
    Alert.alert(t('events:detail.confirmLeave'), t('events:detail.confirmLeaveMessage'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('common:confirm'), style: 'destructive', onPress: async () => {
        setActionLoading(true);
        try { await leaveEvent(event.id, user.id); } catch { /* handled */ }
        setActionLoading(false);
      }},
    ]);
  };

  const handleCancel = () => {
    if (!event) return;
    Alert.alert(t('events:detail.confirmCancel'), t('events:detail.confirmCancelMessage'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('events:detail.cancel'), style: 'destructive', onPress: async () => {
        setActionLoading(true);
        try { await cancelEvent(event.id); navigation.goBack(); } catch { /* handled */ }
        setActionLoading(false);
      }},
    ]);
  };

  if (isLoading || !event) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.lime} />
      </View>
    );
  }

  const costPerPerson = calculateCostPerPerson(event.venue_cost, event.current_participants);
  const isFull = event.current_participants >= event.max_participants;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {event.is_creator && (
            <TouchableOpacity onPress={() => navigation.navigate('EditEvent', { eventId: event.id })} style={styles.headerBtn}>
              <Ionicons name="create-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sportRow}>
          <View style={styles.sportIcon}>
            <Text style={styles.sportEmoji}>{SPORT_EMOJI[event.sport]}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        {event.description && <Text style={styles.description}>{event.description}</Text>}

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent.lime} />
            <View>
              <Text style={styles.infoLabel}>{t('events:detail.dateTime')}</Text>
              <Text style={styles.infoValue}>{formatDateTime(event.date_time)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.accent.lime} />
            <View>
              <Text style={styles.infoLabel}>{t('events:detail.location')}</Text>
              <Text style={styles.infoValue}>{event.location_name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="fitness-outline" size={18} color={colors.accent.lime} />
            <View>
              <Text style={styles.infoLabel}>{t('events:detail.skillLevel')}</Text>
              <Text style={styles.infoValue}>{event.skill_level}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={colors.accent.lime} />
            <View>
              <Text style={styles.infoLabel}>{t('events:detail.genderPref')}</Text>
              <Text style={styles.infoValue}>{event.gender_preference}</Text>
            </View>
          </View>
        </View>

        {/* Cost Split */}
        {event.venue_cost > 0 && (
          <View style={styles.costCard}>
            <Text style={styles.costTitle}>{t('events:detail.costSplit')}</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>{t('events:detail.venueCost', { cost: formatCurrency(event.venue_cost) })}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>{t('events:detail.splitBetween', { count: event.current_participants })}</Text>
            </View>
            <Text style={styles.costAmount}>{t('events:detail.costPerPerson', { cost: formatCurrency(costPerPerson) })}</Text>
          </View>
        )}

        {/* Organizer */}
        <View style={styles.organizerCard}>
          <Text style={styles.sectionTitle}>{t('events:detail.organizer')}</Text>
          <View style={styles.organizerRow}>
            {event.creator.avatar_url ? (
              <Image source={{ uri: event.creator.avatar_url }} style={styles.organizerAvatar} />
            ) : (
              <View style={[styles.organizerAvatarFallback, { backgroundColor: getAvatarColor(event.creator.name) }]}>
                <Text style={styles.organizerInitial}>{getInitial(event.creator.name)}</Text>
              </View>
            )}
            <Text style={styles.organizerName}>{event.creator.name}</Text>
            {!event.is_creator && (
              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => navigation.navigate('DirectMessage', { userId: event.creator.id, userName: event.creator.name })}
              >
                <Ionicons name="chatbubble-outline" size={16} color={colors.accent.lime} />
                <Text style={styles.messageBtnText}>{t('events:detail.message')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('events:detail.participants')} ({event.current_participants}/{event.max_participants})
          </Text>
          <View style={styles.participantsGrid}>
            {event.participants.map((p) => (
              <TouchableOpacity
                key={p.user_id}
                style={styles.participantItem}
                onPress={() => navigation.navigate('PublicProfile', { userId: p.user_id })}
              >
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={styles.participantAvatar} />
                ) : (
                  <View style={[styles.participantAvatarFallback, { backgroundColor: getAvatarColor(p.name) }]}>
                    <Text style={styles.participantInitial}>{getInitial(p.name)}</Text>
                  </View>
                )}
                <Text style={styles.participantName} numberOfLines={1}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group Chat */}
        {event.is_joined && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('GroupChat', { eventId: event.id, eventTitle: event.title })}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={colors.accent.lime} />
            <Text style={styles.chatButtonText}>{t('events:detail.groupChat')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {event.status === 'cancelled' ? (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>{t('events:detail.cancelled')}</Text>
          </View>
        ) : event.is_creator ? (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={actionLoading}>
            <Text style={styles.cancelButtonText}>{t('events:detail.cancel')}</Text>
          </TouchableOpacity>
        ) : event.is_joined ? (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color={colors.text.primary} /> : (
              <Text style={styles.leaveButtonText}>{t('events:detail.leave')}</Text>
            )}
          </TouchableOpacity>
        ) : isFull ? (
          <View style={styles.fullBanner}>
            <Text style={styles.fullText}>{t('events:detail.full')}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color={colors.bg.primary} /> : (
              <Text style={styles.joinButtonText}>{t('events:detail.join')}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loading: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: 20 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  sportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  sportIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center' },
  sportEmoji: { fontSize: 28 },
  statusBadge: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText: { color: colors.accent.lime, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.md },
  description: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  infoGrid: { gap: spacing.md, marginBottom: spacing.xl },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 12, padding: spacing.md },
  infoLabel: { color: colors.text.muted, fontSize: 12 },
  infoValue: { color: colors.text.primary, fontSize: 15, fontWeight: '500', textTransform: 'capitalize' },
  costCard: { backgroundColor: colors.bg.elevated, borderRadius: borderRadius.card, padding: spacing.base, marginBottom: spacing.xl },
  costTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  costRow: { marginBottom: spacing.xs },
  costLabel: { color: colors.text.secondary, fontSize: 14 },
  costAmount: { color: colors.accent.lime, fontSize: 24, fontWeight: '700', marginTop: spacing.sm },
  organizerCard: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  organizerAvatar: { width: 44, height: 44, borderRadius: 22 },
  organizerAvatarFallback: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  organizerInitial: { color: colors.bg.primary, fontSize: 18, fontWeight: '700' },
  organizerName: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  messageBtnText: { color: colors.accent.lime, fontSize: 13, fontWeight: '500' },
  section: { marginBottom: spacing.xl },
  participantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  participantItem: { alignItems: 'center', width: 64 },
  participantAvatar: { width: 48, height: 48, borderRadius: 24 },
  participantAvatarFallback: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  participantInitial: { color: colors.bg.primary, fontSize: 18, fontWeight: '700' },
  participantName: { color: colors.text.secondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
  chatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.accent.lime },
  chatButtonText: { color: colors.accent.lime, fontSize: 15, fontWeight: '600' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, paddingBottom: spacing['3xl'], backgroundColor: colors.bg.primary, borderTopWidth: 1, borderTopColor: colors.border.subtle },
  joinButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  joinButtonText: { ...typography.button, color: colors.bg.primary },
  leaveButton: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', borderWidth: 1, borderColor: colors.border.default },
  leaveButtonText: { ...typography.button, color: colors.text.primary },
  cancelButton: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  cancelButtonText: { ...typography.button, color: colors.danger },
  fullBanner: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  fullText: { ...typography.button, color: colors.text.muted },
  cancelledBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  cancelledText: { ...typography.button, color: colors.danger },
});

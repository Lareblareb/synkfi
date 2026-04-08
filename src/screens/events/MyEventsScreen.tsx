import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useMyEvents } from '../../hooks/useEvents';
import { EventWithCreator, SPORT_EMOJI } from '../../types/event.types';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const MyEventsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['events', 'common']);
  const { joinedEvents, createdEvents, isLoading, refresh } = useMyEvents();
  const [tab, setTab] = useState<'joined' | 'created'>('joined');

  const data = tab === 'joined' ? joinedEvents : createdEvents;

  const renderEvent = ({ item }: { item: EventWithCreator }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportEmoji}>{SPORT_EMOJI[item.sport]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>{formatDateTime(item.date_time)}</Text>
          <Text style={styles.cardMeta}>{item.location_name}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.participantCount}>{item.current_participants}/{item.max_participants}</Text>
          <Text style={styles.costText}>{item.venue_cost > 0 ? formatCurrency(item.cost_per_person) : t('common:free')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>{tab === 'joined' ? t('events:noJoinedEvents') : t('events:noCreatedEvents')}</Text>
      <Text style={styles.emptyHint}>{tab === 'joined' ? t('events:noJoinedEventsHint') : t('events:noCreatedEventsHint')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
      </View>

      <Text style={styles.title}>{t('events:myEvents')}</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'joined' && styles.tabActive]} onPress={() => setTab('joined')}>
          <Text style={[styles.tabText, tab === 'joined' && styles.tabTextActive]}>{t('events:joined')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'created' && styles.tabActive]} onPress={() => setTab('created')}>
          <Text style={[styles.tabText, tab === 'created' && styles.tabTextActive]}>{t('events:created')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent.lime} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  title: { ...typography.h1, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.base },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.bg.surface, borderRadius: 9999, padding: 3, marginBottom: spacing.base },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 9999, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent.lime },
  tabText: { color: colors.text.secondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: colors.bg.primary },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.md },
  card: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, borderWidth: 1, borderColor: colors.border.subtle },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sportBadge: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.bg.elevated, justifyContent: 'center', alignItems: 'center' },
  sportEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  cardMeta: { color: colors.text.secondary, fontSize: 13 },
  cardRight: { alignItems: 'flex-end' },
  participantCount: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  costText: { color: colors.accent.lime, fontSize: 13, fontWeight: '500', marginTop: 2 },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base, textAlign: 'center' },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});

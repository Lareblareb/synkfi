import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEvents, useMyEvents } from '../../hooks/useEvents';
import { useNotificationsStore } from '../../store/notifications';
import { EventWithCreator, SPORT_EMOJI } from '../../types/event.types';
import { FilterModal } from '../discovery/FilterModal';
import { EventMapView } from '../../components/map/EventMapView';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

type TabKey = 'discover' | 'joined' | 'created';
type ViewMode = 'list' | 'map';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['discovery', 'events', 'common']);
  const { events: discoveryEvents, isLoading: isDiscoveryLoading, refresh: refreshDiscovery } = useEvents();
  const { joinedEvents, createdEvents, isLoading: isMyEventsLoading, refresh: refreshMyEvents } = useMyEvents();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterVisible, setFilterVisible] = useState(false);

  const displayedEvents = useMemo<EventWithCreator[]>(() => {
    if (activeTab === 'discover') return discoveryEvents;
    if (activeTab === 'joined') return joinedEvents;
    return createdEvents;
  }, [activeTab, discoveryEvents, joinedEvents, createdEvents]);

  const isLoading = activeTab === 'discover' ? isDiscoveryLoading : isMyEventsLoading;
  const showControls = activeTab === 'discover';

  const handleRefresh = useCallback(() => {
    if (activeTab === 'discover') {
      refreshDiscovery();
    } else {
      refreshMyEvents();
    }
  }, [activeTab, refreshDiscovery, refreshMyEvents]);

  const renderEventCard = useCallback(({ item }: { item: EventWithCreator }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportEmoji}>{SPORT_EMOJI[item.sport] ?? '🤸'}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.skillBadgeText}>{item.skill_level}</Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.eventMeta}>
        <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
        <Text style={styles.eventMetaText}>{formatDateTime(item.date_time)}</Text>
      </View>
      <View style={styles.eventMeta}>
        <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
        <Text style={styles.eventMetaText}>{item.location_name}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.participantPill}>
          <Ionicons name="people" size={12} color={colors.accent.lime} />
          <Text style={styles.participantText}>
            {item.current_participants}/{item.max_participants}
          </Text>
        </View>
        <View style={styles.costPill}>
          <Text style={styles.costText}>
            {item.venue_cost > 0 ? formatCurrency(item.cost_per_person) : t('common:free')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation, t]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'discover' ? 'compass-outline' : 'calendar-outline'}
        size={64}
        color={colors.text.muted}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'discover'
          ? t('discovery:noEvents')
          : activeTab === 'joined'
            ? t('events:noJoinedEvents')
            : t('events:noCreatedEvents')}
      </Text>
      <Text style={styles.emptyHint}>
        {activeTab === 'discover'
          ? t('discovery:noEventsHint')
          : activeTab === 'joined'
            ? t('events:noJoinedEventsHint')
            : t('events:noCreatedEventsHint')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.tabActive]}
          onPress={() => {
            setActiveTab('joined');
            setViewMode('list');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>
            Joined
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.tabActive]}
          onPress={() => {
            setActiveTab('created');
            setViewMode('list');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'created' && styles.tabTextActive]}>
            Created
          </Text>
        </TouchableOpacity>
      </View>

      {/* Controls - ONLY on Discover */}
      {showControls && (
        <View style={styles.controls}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={14} color={viewMode === 'list' ? colors.bg.primary : colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map" size={14} color={viewMode === 'map' ? colors.bg.primary : colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
            <Ionicons name="options-outline" size={18} color={colors.text.primary} />
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {showControls && viewMode === 'map' ? (
        <View style={styles.mapWrap}>
          <EventMapView
            events={displayedEvents}
            onEventPress={(id) => navigation.navigate('EventDetail', { eventId: id })}
          />
        </View>
      ) : (
        <FlatList
          data={displayedEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmpty : null}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.accent.lime}
            />
          }
        />
      )}

      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  headerRight: { flexDirection: 'row', gap: spacing.md },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.accent.lime,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.bg.primary, fontSize: 10, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tabActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  tabText: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.bg.primary, fontWeight: '700' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
  },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.bg.surface, borderRadius: 9999, padding: 3 },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
  },
  toggleActive: { backgroundColor: colors.accent.lime },
  toggleText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  toggleTextActive: { color: colors.bg.primary, fontWeight: '700' },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterText: { color: colors.text.primary, fontSize: 13, fontWeight: '500' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] + 80, gap: spacing.md },
  eventCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sportBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bg.elevated, justifyContent: 'center', alignItems: 'center' },
  sportEmoji: { fontSize: 20 },
  cardHeaderRight: { backgroundColor: colors.bg.elevated, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  skillBadgeText: { color: colors.text.secondary, fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  eventTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  eventMetaText: { color: colors.text.secondary, fontSize: 13 },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  participantPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bg.elevated, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  participantText: { color: colors.text.primary, fontSize: 12, fontWeight: '500' },
  costPill: { backgroundColor: colors.bg.elevated, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  costText: { color: colors.accent.lime, fontSize: 12, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base, textAlign: 'center' },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  mapWrap: { flex: 1, marginBottom: 80 },
});

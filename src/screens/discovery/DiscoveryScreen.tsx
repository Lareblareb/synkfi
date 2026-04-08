import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEvents } from '../../hooks/useEvents';
import { useNotificationsStore } from '../../store/notifications';
import { EventWithCreator } from '../../types/event.types';
import { FilterModal } from './FilterModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { SPORT_EMOJI } from '../../types/event.types';

export const DiscoveryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['discovery', 'common']);
  const { events, isLoading, viewMode, setViewMode, refresh } = useEvents();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const [filterVisible, setFilterVisible] = useState(false);

  const renderEventCard = useCallback(({ item }: { item: EventWithCreator }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportEmoji}>{SPORT_EMOJI[item.sport]}</Text>
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
      <Ionicons name="compass-outline" size={64} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>{t('discovery:noEvents')}</Text>
      <Text style={styles.emptyHint}>{t('discovery:noEventsHint')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Inbox')} style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
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

      {/* View Toggle & Filter */}
      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              {t('discovery:listView')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              {t('discovery:mapView')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={18} color={colors.text.primary} />
          <Text style={styles.filterText}>{t('discovery:filters')}</Text>
        </TouchableOpacity>
      </View>

      {/* Event List */}
      {viewMode === 'list' ? (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmpty : null}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={colors.accent.lime}
            />
          }
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={64} color={colors.text.muted} />
          <Text style={styles.mapPlaceholderText}>{t('discovery:mapView')}</Text>
          <Text style={styles.mapHint}>Mapbox map renders here in production builds</Text>
        </View>
      )}

      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  headerRight: { flexDirection: 'row', gap: spacing.md },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.accent.lime, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: colors.bg.primary, fontSize: 10, fontWeight: '700' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.base },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.bg.surface, borderRadius: 9999, padding: 3 },
  toggleButton: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: 9999 },
  toggleActive: { backgroundColor: colors.accent.lime },
  toggleText: { color: colors.text.secondary, fontSize: 14, fontWeight: '500' },
  toggleTextActive: { color: colors.bg.primary },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  filterText: { color: colors.text.primary, fontSize: 13, fontWeight: '500' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.md },
  eventCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, borderWidth: 1, borderColor: colors.border.subtle },
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
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapPlaceholderText: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
  mapHint: { color: colors.text.muted, fontSize: 13, marginTop: spacing.sm },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventWithCreator, SPORT_EMOJI } from '../../types/event.types';
import { useEventsStore } from '../../store/events';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface EventMapViewProps {
  events: EventWithCreator[];
  onEventPress: (eventId: string) => void;
}

export const EventMapView: React.FC<EventMapViewProps> = ({ events, onEventPress }) => {
  const filters = useEventsStore((s) => s.filters);
  const radiusKm = filters.distance || 10;

  // Always use the fallback map for now — react-native-maps requires
  // Google Maps API key for Android which causes crashes without it.
  // When you add a Google Maps API key, you can enable the real map.
  return (
    <FallbackMapView events={events} onEventPress={onEventPress} radiusKm={radiusKm} />
  );
};

const FallbackMapView: React.FC<EventMapViewProps & { radiusKm: number }> = ({
  events,
  onEventPress,
  radiusKm,
}) => {
  return (
    <View style={styles.fallbackContainer}>
      {/* Map header */}
      <View style={styles.mapHeader}>
        <View style={styles.radiusInfo}>
          <Ionicons name="radio-outline" size={14} color={colors.accent.lime} />
          <Text style={styles.radiusText}>{radiusKm} km radius</Text>
        </View>
        <View style={styles.eventCountInfo}>
          <Text style={styles.eventCountText}>
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </Text>
        </View>
      </View>

      {/* Map visual */}
      <View style={styles.mapVisual}>
        <View style={styles.radiusCircle}>
          <View style={styles.radiusCircleInner}>
            <Ionicons name="location" size={36} color={colors.accent.lime} />
            <Text style={styles.cityName}>Helsinki</Text>
            <Text style={styles.coords}>60.17°N, 24.94°E</Text>
          </View>
        </View>
      </View>

      {/* Event list */}
      {events.length > 0 ? (
        <FlatList
          data={events}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventPin}
              onPress={() => onEventPress(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.eventPinEmoji}>{SPORT_EMOJI[item.sport] ?? '🤸'}</Text>
              <Text style={styles.eventPinTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.eventPinLocation} numberOfLines={1}>{item.location_name}</Text>
              <View style={styles.eventPinBadge}>
                <Ionicons name="people" size={10} color={colors.accent.lime} />
                <Text style={styles.eventPinCount}>
                  {item.current_participants}/{item.max_participants}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noEventsWrap}>
          <Text style={styles.noEventsText}>No events in this area</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: { flex: 1, backgroundColor: colors.bg.primary },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  radiusText: { color: colors.accent.lime, fontSize: 12, fontWeight: '700' },
  eventCountInfo: {
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  eventCountText: { color: colors.text.primary, fontSize: 12, fontWeight: '600' },
  mapVisual: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  radiusCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(197, 241, 53, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(197, 241, 53, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(197, 241, 53, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197, 241, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xs },
  coords: { color: colors.text.muted, fontSize: 11, marginTop: 2 },
  eventsList: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },
  eventPin: {
    width: 150,
    padding: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginRight: spacing.sm,
  },
  eventPinEmoji: { fontSize: 24, marginBottom: spacing.xs },
  eventPinTitle: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  eventPinLocation: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  eventPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  eventPinCount: { color: colors.accent.lime, fontSize: 11, fontWeight: '600' },
  noEventsWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  noEventsText: { color: colors.text.muted, fontSize: 14, textAlign: 'center' },
});

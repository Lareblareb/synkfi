import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventWithCreator, SPORT_EMOJI } from '../../types/event.types';
import { useEventsStore } from '../../store/events';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HELSINKI_LAT = 60.1699;
const HELSINKI_LNG = 24.9384;

interface EventMapViewProps {
  events: EventWithCreator[];
  onEventPress: (eventId: string) => void;
}

// Lazy-load react-native-maps so the app still runs if it's not installed
let MapModule: typeof import('react-native-maps') | null = null;
try {
  MapModule = require('react-native-maps');
} catch (err) {
  MapModule = null;
}

export const EventMapView: React.FC<EventMapViewProps> = ({ events, onEventPress }) => {
  const filters = useEventsStore((s) => s.filters);
  const radiusKm = filters.distance || 10;

  if (!MapModule) {
    return <FallbackMapView events={events} onEventPress={onEventPress} radiusKm={radiusKm} />;
  }

  const MapView = MapModule.default;
  const { Marker, Circle } = MapModule;

  // Deterministic event positions around Helsinki for demo (since events don't have real coords)
  const getEventCoords = (eventId: string, idx: number) => {
    const hash = eventId
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const distance = 0.005 + (idx % 5) * 0.008; // ~0.5 to 4 km
    return {
      latitude: HELSINKI_LAT + Math.sin(angle) * distance,
      longitude: HELSINKI_LNG + Math.cos(angle) * distance,
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: HELSINKI_LAT,
          longitude: HELSINKI_LNG,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={DARK_MAP_STYLE}
      >
        {/* Search radius */}
        <Circle
          center={{ latitude: HELSINKI_LAT, longitude: HELSINKI_LNG }}
          radius={radiusKm * 1000}
          strokeColor="rgba(197, 241, 53, 0.6)"
          fillColor="rgba(197, 241, 53, 0.12)"
          strokeWidth={2}
        />

        {/* Event markers */}
        {events.map((event, idx) => {
          const coords = getEventCoords(event.id, idx);
          return (
            <Marker
              key={event.id}
              coordinate={coords}
              onPress={() => onEventPress(event.id)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Text style={styles.markerEmoji}>
                    {SPORT_EMOJI[event.sport] ?? '🤸'}
                  </Text>
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Radius display */}
      <View style={styles.radiusInfo}>
        <Ionicons name="radio-outline" size={14} color={colors.accent.lime} />
        <Text style={styles.radiusText}>{radiusKm} km radius</Text>
      </View>

      {/* Event count */}
      <View style={styles.eventCountInfo}>
        <Text style={styles.eventCountText}>
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </Text>
      </View>
    </View>
  );
};

// Fallback when react-native-maps isn't available
const FallbackMapView: React.FC<EventMapViewProps & { radiusKm: number }> = ({
  events,
  onEventPress,
  radiusKm,
}) => {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackCircle}>
        <Ionicons name="map" size={64} color={colors.accent.lime} />
        <Text style={styles.fallbackCity}>Helsinki, Finland</Text>
        <Text style={styles.fallbackRadius}>{radiusKm} km radius</Text>
        <Text style={styles.fallbackCount}>
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </Text>
      </View>

      {events.length > 0 && (
        <View style={styles.fallbackList}>
          {events.slice(0, 5).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.fallbackCard}
              onPress={() => onEventPress(event.id)}
            >
              <Text style={styles.fallbackCardEmoji}>
                {SPORT_EMOJI[event.sport] ?? '🤸'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fallbackCardTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.fallbackCardLocation} numberOfLines={1}>
                  {event.location_name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c5f135' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2a1a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#222222' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c5f135' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#001122' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b6b99' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center' },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.surface,
    borderWidth: 3,
    borderColor: colors.accent.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerEmoji: { fontSize: 20 },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent.lime,
    marginTop: -2,
  },
  radiusInfo: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  radiusText: { color: colors.accent.lime, fontSize: 12, fontWeight: '700' },
  eventCountInfo: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  eventCountText: { color: colors.text.primary, fontSize: 12, fontWeight: '600' },
  // Fallback styles
  fallbackContainer: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing.xl },
  fallbackCircle: {
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  fallbackCity: { ...typography.h2, color: colors.text.primary, marginTop: spacing.md },
  fallbackRadius: { color: colors.accent.lime, fontSize: 14, fontWeight: '600', marginTop: spacing.xs },
  fallbackCount: { color: colors.text.secondary, fontSize: 13, marginTop: spacing.xs },
  fallbackList: { marginTop: spacing.xl, gap: spacing.sm },
  fallbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  fallbackCardEmoji: { fontSize: 24 },
  fallbackCardTitle: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  fallbackCardLocation: { color: colors.text.secondary, fontSize: 12 },
});

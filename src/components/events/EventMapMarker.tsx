import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { EventMapMarkerData, SPORT_EMOJI } from '../../types/event.types';

interface EventMapMarkerProps {
  data: EventMapMarkerData;
  onPress: () => void;
}

export const EventMapMarker: React.FC<EventMapMarkerProps> = ({
  data,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{SPORT_EMOJI[data.sport] ?? '🤸'}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {data.current_participants}
          </Text>
        </View>
      </View>
      <View style={styles.arrow} />
    </TouchableOpacity>
  );
};

const MARKER_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.bg.surface,
    borderWidth: 2,
    borderColor: colors.accent.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent.lime,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '700',
    fontSize: 10,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.bg.surface,
    alignSelf: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { SportType } from '../../types/database.types';
import { SPORT_EMOJI } from '../../types/event.types';

interface SportIconProps {
  sport: SportType;
  size?: number;
}

const SPORT_TINT: Record<SportType, string> = {
  football: 'rgba(16, 185, 129, 0.15)',
  basketball: 'rgba(245, 158, 11, 0.15)',
  tennis: 'rgba(197, 241, 53, 0.15)',
  running: 'rgba(59, 130, 246, 0.15)',
  cycling: 'rgba(239, 68, 68, 0.15)',
  swimming: 'rgba(6, 182, 212, 0.15)',
  volleyball: 'rgba(251, 191, 36, 0.15)',
  padel: 'rgba(168, 85, 247, 0.15)',
  badminton: 'rgba(34, 197, 94, 0.15)',
  ice_hockey: 'rgba(148, 163, 184, 0.15)',
  floorball: 'rgba(249, 115, 22, 0.15)',
  gym_fitness: 'rgba(236, 72, 153, 0.15)',
  board_games: 'rgba(139, 92, 246, 0.15)',
  other: 'rgba(156, 163, 175, 0.15)',
};

export const SportIcon: React.FC<SportIconProps> = ({
  sport,
  size = 48,
}) => {
  const containerSize = size;
  const emojiSize = size * 0.5;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize * 0.3,
          backgroundColor: SPORT_TINT[sport] ?? SPORT_TINT.other,
        },
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{SPORT_EMOJI[sport] ?? '🤸'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
}

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 13,
  md: 16,
  lg: 22,
  xl: 32,
};

const AVATAR_COLORS = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
  '#4FC3F7',
  '#4DD0E1',
  '#4DB6AC',
  '#81C784',
  '#AED581',
  '#DCE775',
  '#FFD54F',
  '#FFB74D',
  '#FF8A65',
];

const getColorFromName = (name: string): string => {
  const safeName = name || '?';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitial = (name: string): string => {
  return (name || '?').charAt(0).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
}) => {
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];
  const safeName = name ?? '';
  const bgColor = getColorFromName(safeName);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: borderRadius.avatar,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: borderRadius.avatar,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{getInitial(safeName)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.bg.elevated,
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
  },
});

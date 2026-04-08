import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius as br } from '../../theme/spacing';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = br.md,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const style: Animated.AnimatedProps<ViewStyle> = {
    width: width as number,
    height,
    borderRadius,
    opacity,
    backgroundColor: colors.bg.elevated,
  };

  return <Animated.View style={[styles.base, style]} />;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface MarqueeTextProps {
  text: string;
  speed?: number;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  speed = 50,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const onTextLayout = (e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (containerWidth === 0 || textWidth === 0) return;
    if (textWidth <= containerWidth) return;

    const totalDistance = textWidth + containerWidth;
    const duration = (totalDistance / speed) * 1000;

    translateX.setValue(containerWidth);

    animationRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration,
        useNativeDriver: true,
      })
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [containerWidth, textWidth, speed, translateX]);

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Animated.View
        style={[styles.textWrapper, { transform: [{ translateX }] }]}
      >
        <Text
          style={styles.text}
          numberOfLines={1}
          onLayout={onTextLayout}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  textWrapper: {
    flexDirection: 'row',
  },
  text: {
    ...typography.body,
    color: colors.text.primary,
  },
});

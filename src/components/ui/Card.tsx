import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  bordered = false,
}) => {
  const cardStyle: StyleProp<ViewStyle>[] = [
    styles.container,
    bordered && styles.bordered,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});

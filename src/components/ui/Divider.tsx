import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface DividerProps {
  color?: string;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  color = colors.border.subtle,
  spacing: verticalSpacing = spacing.base,
}) => {
  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: color,
          marginVertical: verticalSpacing,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: '100%',
  },
});

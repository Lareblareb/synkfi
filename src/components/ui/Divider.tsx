import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing as themeSpacing } from '../../theme/spacing';

interface DividerProps {
  color?: string;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  color = colors.border.subtle,
  spacing = themeSpacing.base,
}) => {
  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: color,
          marginVertical: spacing,
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

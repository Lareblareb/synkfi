import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { formatCurrency } from '../../utils/formatters';

interface CostSplitBannerProps {
  venueCost: number;
  currentParticipants: number;
}

export const CostSplitBanner: React.FC<CostSplitBannerProps> = ({
  venueCost,
  currentParticipants,
}) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const costPerPerson =
    currentParticipants > 0 ? venueCost / currentParticipants : venueCost;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [venueCost, currentParticipants, scaleAnim]);

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>
            {t('events:venueCost', { defaultValue: 'Venue cost' })}
          </Text>
          <Text style={styles.value}>{formatCurrency(venueCost)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <Text style={styles.label}>
            {t('events:participants', { defaultValue: 'Participants' })}
          </Text>
          <Text style={styles.value}>{currentParticipants}</Text>
        </View>

        <View style={styles.divider} />

        <Animated.View
          style={[styles.column, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.label}>
            {t('events:perPerson', { defaultValue: 'Per person' })}
          </Text>
          <Text style={styles.costPerPerson}>
            {formatCurrency(costPerPerson)}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h3,
    color: colors.text.primary,
  },
  costPerPerson: {
    ...typography.h3,
    color: colors.accent.lime,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.sm,
  },
});

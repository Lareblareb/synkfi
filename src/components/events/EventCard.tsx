import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { EventWithCreator, SPORT_EMOJI } from '../../types/event.types';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

interface EventCardProps {
  event: EventWithCreator;
  onPress: () => void;
}

const SKILL_COLORS: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  pro: '#8B5CF6',
};

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { t } = useTranslation();

  const skillColor = SKILL_COLORS[event.skill_level] ?? colors.text.muted;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.sportEmoji}>
          {SPORT_EMOJI[event.sport]}
        </Text>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.dateTime}>
            {formatDateTime(event.date_time)}
          </Text>
        </View>
      </View>

      <Text style={styles.location} numberOfLines={1}>
        {event.location_name}
      </Text>

      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {event.current_participants}/{event.max_participants}{' '}
            {t('events:players', { defaultValue: 'players' })}
          </Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {formatCurrency(event.cost_per_person)}{' '}
            {t('events:perPerson', { defaultValue: '/ person' })}
          </Text>
        </View>

        <View style={[styles.skillBadge, { borderColor: skillColor }]}>
          <Text style={[styles.skillText, { color: skillColor }]}>
            {event.skill_level}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sportEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  dateTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  location: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  skillBadge: {
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skillText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

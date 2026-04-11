import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventsStore } from '../../store/events';
import { SportType, SkillLevel, GenderPreference } from '../../types/database.types';
import { SPORT_LIST, SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation('discovery');
  const { filters, setFilters, resetFilters } = useEventsStore();
  const [distanceInput, setDistanceInput] = useState(filters.distance.toString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleSport = (sport: SportType) => {
    const current = filters.sports;
    const updated = current.includes(sport)
      ? current.filter((s) => s !== sport)
      : [...current, sport];
    setFilters({ sports: updated });
  };

  const updateDistance = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setDistanceInput(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0) {
      setFilters({ distance: num });
    }
  };

  const handleDateChange = (event: { type?: string }, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type !== 'set' || !selectedDate) return;
    }
    if (selectedDate) {
      setFilters({
        dateRange: 'custom',
        customDate: selectedDate.toISOString(),
      });
    }
  };

  const skillOptions: Array<SkillLevel | 'any'> = ['any', 'beginner', 'intermediate', 'advanced', 'pro'];
  const genderOptions: GenderPreference[] = ['any', 'men', 'women', 'mixed'];
  const dateOptions = ['today', 'tomorrow', 'this_week', 'this_weekend'] as const;

  const formatCustomDate = () => {
    if (!filters.customDate) return '';
    const d = new Date(filters.customDate);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  const handleReset = () => {
    resetFilters();
    setDistanceInput('10');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('filterTitle')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sport Type */}
            <Text style={styles.sectionTitle}>{t('sportType')}</Text>
            <View style={styles.chipsRow}>
              {SPORT_LIST.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[styles.chip, filters.sports.includes(sport) && styles.chipActive]}
                  onPress={() => toggleSport(sport)}
                >
                  <Text style={styles.chipEmoji}>{SPORT_EMOJI[sport]}</Text>
                  <Text style={[styles.chipText, filters.sports.includes(sport) && styles.chipTextActive]}>
                    {SPORT_LABELS[sport]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Skill Level */}
            <Text style={styles.sectionTitle}>{t('skillLevel')}</Text>
            <View style={styles.pillRow}>
              {skillOptions.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.pill, filters.skillLevel === level && styles.pillActive]}
                  onPress={() => setFilters({ skillLevel: level })}
                >
                  <Text style={[styles.pillText, filters.skillLevel === level && styles.pillTextActive]}>
                    {t(`skillOptions.${level}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Distance - no limit */}
            <Text style={styles.sectionTitle}>{t('distance')} (km)</Text>
            <View style={styles.distanceRow}>
              <TextInput
                style={styles.distanceInput}
                value={distanceInput}
                onChangeText={updateDistance}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={colors.text.muted}
                maxLength={5}
              />
              <Text style={styles.distanceUnit}>km</Text>
            </View>
            <View style={styles.distanceQuickRow}>
              {[5, 10, 25, 50, 100].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.quickBtn, parseInt(distanceInput, 10) === d && styles.quickBtnActive]}
                  onPress={() => updateDistance(d.toString())}
                >
                  <Text
                    style={[
                      styles.quickBtnText,
                      parseInt(distanceInput, 10) === d && styles.quickBtnTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <Text style={styles.sectionTitle}>{t('dateRange')}</Text>
            <View style={styles.pillRow}>
              {dateOptions.map((dr) => (
                <TouchableOpacity
                  key={dr}
                  style={[styles.pill, filters.dateRange === dr && styles.pillActive]}
                  onPress={() =>
                    setFilters({
                      dateRange: filters.dateRange === dr ? null : dr,
                      customDate: null,
                    })
                  }
                >
                  <Text style={[styles.pillText, filters.dateRange === dr && styles.pillTextActive]}>
                    {t(
                      `common:${
                        dr === 'this_week' ? 'thisWeek' : dr === 'this_weekend' ? 'thisWeekend' : dr
                      }`
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.pill, filters.dateRange === 'custom' && styles.pillActive]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={filters.dateRange === 'custom' ? colors.bg.primary : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.pillText,
                    filters.dateRange === 'custom' && styles.pillTextActive,
                  ]}
                >
                  {filters.dateRange === 'custom' && filters.customDate
                    ? formatCustomDate()
                    : 'Pick a date'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={filters.customDate ? new Date(filters.customDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="dark"
              />
            )}

            {/* Gender */}
            <Text style={styles.sectionTitle}>{t('gender')}</Text>
            <View style={styles.pillRow}>
              {genderOptions.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.pill, filters.gender === g && styles.pillActive]}
                  onPress={() => setFilters({ gender: g })}
                >
                  <Text style={[styles.pillText, filters.gender === g && styles.pillTextActive]}>
                    {t(`genderOptions.${g}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleReset}>
              <Text style={styles.clearText}>{t('clearFilters')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyText}>{t('applyFilters')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: { ...typography.h2, color: colors.text.primary },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipActive: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 14 },
  chipText: { color: colors.text.secondary, fontSize: 13 },
  chipTextActive: { color: colors.accent.lime, fontWeight: '600' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pillActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  pillText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: colors.bg.primary },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  distanceInput: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  distanceUnit: { color: colors.text.muted, fontSize: 14, fontWeight: '500' },
  distanceQuickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  quickBtnActive: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  quickBtnText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  quickBtnTextActive: { color: colors.accent.lime, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  clearButton: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  clearText: { color: colors.text.primary, fontSize: 15, fontWeight: '600' },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: { color: colors.bg.primary, fontSize: 15, fontWeight: '700' },
});

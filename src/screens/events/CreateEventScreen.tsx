import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../navigation/types';
import { useEventsStore } from '../../store/events';
import { useAuthStore } from '../../store/auth';
import { SportType, SkillLevel, GenderPreference } from '../../types/database.types';
import { SPORT_LIST, SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { calculateCostPerPerson } from '../../utils/costSplitter';
import { formatCurrency } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'pro'];
const GENDERS: GenderPreference[] = ['any', 'men', 'women', 'mixed'];

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['events', 'common', 'discovery']);
  const { createEvent, isLoading } = useEventsStore();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);

  // Step 1
  const [sport, setSport] = useState<SportType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [genderPref, setGenderPref] = useState<GenderPreference>('any');

  // Step 2
  const [dateTime, setDateTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);

  // Step 3
  const [venueCost, setVenueCost] = useState('0');

  const [error, setError] = useState<string | null>(null);

  const validateStep = (): boolean => {
    setError(null);
    if (step === 1) {
      if (!sport) { setError(t('events:create.sportRequired')); return false; }
      if (!title.trim()) { setError(t('events:create.titleRequired')); return false; }
    }
    if (step === 2) {
      if (!locationName.trim()) { setError(t('events:create.locationRequired')); return false; }
      if (maxParticipants < 2) { setError(t('events:create.maxParticipantsMin')); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handlePublish = async () => {
    if (!user || !sport) return;
    try {
      const eventId = await createEvent({
        sport: sport as SportType,
        title: title.trim(),
        description: description.trim(),
        skill_level: skillLevel,
        gender_preference: genderPref,
        date_time: dateTime.toISOString(),
        location_name: locationName.trim() || 'Helsinki',
        latitude: 60.1699,
        longitude: 24.9384,
        max_participants: maxParticipants,
        venue_cost: parseFloat(venueCost) || 0,
      }, user.id);
      navigation.navigate('EventDetail', { eventId });
    } catch {
      setError(t('common:error'));
    }
  };

  const costPreview = parseFloat(venueCost) > 0
    ? formatCurrency(calculateCostPerPerson(parseFloat(venueCost), maxParticipants))
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('events:create.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>{t('events:create.step', { current: step, total: 3 })}</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>{t('events:create.sport')}</Text>
            <View style={styles.chipsGrid}>
              {SPORT_LIST.map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, sport === s && styles.chipActive]} onPress={() => setSport(s)}>
                  <Text style={styles.chipEmoji}>{SPORT_EMOJI[s]}</Text>
                  <Text style={[styles.chipText, sport === s && styles.chipTextActive]}>{SPORT_LABELS[s]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('events:create.eventTitle')}</Text>
            <TextInput style={styles.input} placeholder={t('events:create.eventTitlePlaceholder')} placeholderTextColor={colors.text.muted} value={title} onChangeText={setTitle} />

            <Text style={styles.sectionTitle}>{t('events:create.description')}</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder={t('events:create.descriptionPlaceholder')} placeholderTextColor={colors.text.muted} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />

            <Text style={styles.sectionTitle}>{t('events:create.skillLevel')}</Text>
            <View style={styles.pillRow}>
              {SKILL_LEVELS.map((l) => (
                <TouchableOpacity key={l} style={[styles.pill, skillLevel === l && styles.pillActive]} onPress={() => setSkillLevel(l)}>
                  <Text style={[styles.pillText, skillLevel === l && styles.pillTextActive]}>{t(`discovery:skillOptions.${l}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('events:create.genderPreference')}</Text>
            <View style={styles.pillRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity key={g} style={[styles.pill, genderPref === g && styles.pillActive]} onPress={() => setGenderPref(g)}>
                  <Text style={[styles.pillText, genderPref === g && styles.pillTextActive]}>{t(`discovery:genderOptions.${g}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>{t('events:create.dateTime')}</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={colors.accent.lime} />
              <Text style={styles.dateText}>{dateTime.toLocaleDateString('fi-FI')} {dateTime.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker value={dateTime} mode="datetime" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, date) => { setShowPicker(Platform.OS === 'ios'); if (date) setDateTime(date); }} minimumDate={new Date()} themeVariant="dark" />
            )}

            <Text style={styles.sectionTitle}>{t('events:create.location')}</Text>
            <TextInput style={styles.input} placeholder={t('events:create.searchLocation')} placeholderTextColor={colors.text.muted} value={locationName} onChangeText={setLocationName} />

            <Text style={styles.sectionTitle}>{t('events:create.maxParticipants')}</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}>
                <Ionicons name="remove" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{maxParticipants}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => setMaxParticipants(maxParticipants + 1)}>
                <Ionicons name="add" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.sectionTitle}>{t('events:create.venueCost')}</Text>
            <View style={styles.costInputRow}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput style={styles.costInput} placeholder={t('events:create.venueCostPlaceholder')} placeholderTextColor={colors.text.muted} value={venueCost} onChangeText={setVenueCost} keyboardType="decimal-pad" />
            </View>
            {costPreview ? (
              <Text style={styles.costPreview}>{t('events:create.costPreview', { cost: costPreview })}</Text>
            ) : (
              <Text style={styles.freeNote}>{t('events:create.noVenueCost')}</Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>{t('common:next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.publishButton, isLoading && styles.buttonDisabled]} onPress={handlePublish} disabled={isLoading} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color={colors.bg.primary} /> : <Text style={styles.publishButtonText}>{t('events:create.publish')}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.bg.surface },
  progressDotActive: { backgroundColor: colors.accent.lime },
  stepLabel: { color: colors.text.muted, fontSize: 13, textAlign: 'center', marginBottom: spacing.base },
  errorBanner: { marginHorizontal: spacing.xl, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  errorText: { color: colors.danger, fontSize: 14 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  sectionTitle: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '600', marginTop: spacing.xl, marginBottom: spacing.md },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  chipActive: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 16 },
  chipText: { color: colors.text.secondary, fontSize: 13 },
  chipTextActive: { color: colors.accent.lime, fontWeight: '600' },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  textArea: { minHeight: 100, paddingTop: spacing.md },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  pillActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  pillText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: colors.bg.primary },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  dateText: { color: colors.text.primary, fontSize: 16 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, justifyContent: 'center' },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border.default },
  stepperValue: { color: colors.text.primary, fontSize: 32, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  costInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base },
  currencySymbol: { color: colors.accent.lime, fontSize: 24, fontWeight: '700', marginRight: spacing.sm },
  costInput: { flex: 1, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 24, fontWeight: '600' },
  costPreview: { color: colors.accent.lime, fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  freeNote: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.md },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, paddingBottom: spacing['3xl'], backgroundColor: colors.bg.primary, borderTopWidth: 1, borderTopColor: colors.border.subtle },
  nextButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  nextButtonText: { ...typography.button, color: colors.bg.primary },
  publishButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  publishButtonText: { ...typography.button, color: colors.bg.primary },
});

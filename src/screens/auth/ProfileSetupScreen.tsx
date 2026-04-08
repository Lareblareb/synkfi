import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/auth';
import { storageService } from '../../services/storage';
import { SportType, SkillLevel } from '../../types/database.types';
import { SPORT_LIST, SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'pro'];

export const ProfileSetupScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { completeProfileSetup, user, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleSport = (sport: SportType) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      setError(t('profileSetup.nameRequired'));
      return;
    }
    if (selectedSports.length === 0) {
      setError(t('profileSetup.selectAtLeastOneSport'));
      return;
    }
    setError(null);

    try {
      let uploadedUrl: string | null = null;
      if (avatarUri && user) {
        uploadedUrl = await storageService.uploadAvatar(user.id, avatarUri);
      }

      await completeProfileSetup({
        name: name.trim(),
        avatar_uri: uploadedUrl,
        sports: selectedSports,
        skill_level: skillLevel,
        location_name: 'Helsinki, Finland',
      });
    } catch {
      setError(t('profileSetup.nameRequired'));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profileSetup.title')}</Text>
      <Text style={styles.subtitle}>{t('profileSetup.subtitle')}</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Avatar */}
      <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="camera-outline" size={32} color={colors.text.muted} />
          </View>
        )}
        <Text style={styles.avatarText}>
          {avatarUri ? t('profileSetup.changePhoto') : t('profileSetup.addPhoto')}
        </Text>
      </TouchableOpacity>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('profileSetup.displayName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('profileSetup.displayNamePlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Sports */}
      <View style={styles.section}>
        <Text style={styles.label}>{t('profileSetup.selectSports')}</Text>
        <Text style={styles.hint}>{t('profileSetup.selectSportsHint')}</Text>
        <View style={styles.chipsGrid}>
          {SPORT_LIST.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.chip, selectedSports.includes(sport) && styles.chipSelected]}
              onPress={() => toggleSport(sport)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{SPORT_EMOJI[sport]}</Text>
              <Text style={[styles.chipText, selectedSports.includes(sport) && styles.chipTextSelected]}>
                {SPORT_LABELS[sport]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Skill Level */}
      <View style={styles.section}>
        <Text style={styles.label}>{t('profileSetup.skillLevel')}</Text>
        <View style={styles.skillRow}>
          {SKILL_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.skillPill, skillLevel === level && styles.skillPillSelected]}
              onPress={() => setSkillLevel(level)}
              activeOpacity={0.7}
            >
              <Text style={[styles.skillText, skillLevel === level && styles.skillTextSelected]}>
                {t(`profileSetup.${level}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.label}>{t('profileSetup.location')}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color={colors.accent.lime} />
          <Text style={styles.locationText}>{t('profileSetup.locationDefault')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, isLoading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.bg.primary} />
        ) : (
          <Text style={styles.completeButtonText}>{t('profileSetup.complete')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing['4xl'] },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['2xl'] },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: spacing.md, marginBottom: spacing.base },
  errorText: { color: colors.danger, fontSize: 14 },
  avatarSection: { alignItems: 'center', marginBottom: spacing['2xl'] },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.bg.surface, borderWidth: 2, borderColor: colors.border.default, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.accent.lime, fontSize: 14, fontWeight: '500', marginTop: spacing.sm },
  inputGroup: { marginBottom: spacing.xl },
  label: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500', marginBottom: spacing.sm },
  hint: { color: colors.text.muted, fontSize: 13, marginBottom: spacing.md },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  section: { marginBottom: spacing.xl },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  chipSelected: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 16 },
  chipText: { color: colors.text.secondary, fontSize: 14 },
  chipTextSelected: { color: colors.accent.lime, fontWeight: '600' },
  skillRow: { flexDirection: 'row', gap: spacing.sm },
  skillPill: { flex: 1, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.default },
  skillPillSelected: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  skillText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  skillTextSelected: { color: colors.bg.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 12, padding: spacing.base, borderWidth: 1, borderColor: colors.border.default },
  locationText: { color: colors.text.primary, fontSize: 15 },
  completeButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', marginTop: spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  completeButtonText: { ...typography.button, color: colors.bg.primary },
});

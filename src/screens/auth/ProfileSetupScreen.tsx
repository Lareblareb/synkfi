import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, TextInput, Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/auth';
import { storageService } from '../../services/storage';
import { authService } from '../../services/auth';
import { SportType, SkillLevel } from '../../types/database.types';
import { SPORT_LIST, SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'pro'];
const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: '#3B82F6',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  pro: '#8B5CF6',
};

export const ProfileSetupScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { user, loadUserProfile } = useAuthStore();
  const [name, setName] = useState((user?.name && user.name.trim()) || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [sportSkills, setSportSkills] = useState<Record<string, SkillLevel>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleSport = (sport: SportType) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        const { [sport]: _, ...rest } = sportSkills;
        setSportSkills(rest);
        return prev.filter((s) => s !== sport);
      } else {
        setSportSkills({ ...sportSkills, [sport]: 'beginner' });
        return [...prev, sport];
      }
    });
  };

  const setSportSkillLevel = (sport: SportType, level: SkillLevel) => {
    setSportSkills((prev) => ({ ...prev, [sport]: level }));
  };

  const handleComplete = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('profileSetup.nameRequired'));
      return;
    }
    if (selectedSports.length === 0) {
      setError(t('profileSetup.selectAtLeastOneSport'));
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (!user) {
        setError('User not found, please sign in again');
        setIsLoading(false);
        return;
      }

      let uploadedUrl: string | null = null;
      if (avatarUri) {
        try {
          uploadedUrl = await storageService.uploadAvatar(user.id, avatarUri);
        } catch (uploadErr) {
          console.warn('Avatar upload failed:', uploadErr);
        }
      }

      const primarySkillLevel = sportSkills[selectedSports[0]] ?? 'beginner';

      await authService.updateProfile(user.id, {
        name: trimmedName,
        avatar_url: uploadedUrl ?? user.avatar_url,
        sports: selectedSports,
        sport_skills: sportSkills,
        skill_level: primarySkillLevel,
        location_name: 'Helsinki, Finland',
      });

      await loadUserProfile();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError((err as Error)?.message ?? t('profileSetup.nameRequired'));
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('profileSetup.displayName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('profileSetup.displayNamePlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (error && v.trim()) setError(null);
          }}
          maxLength={50}
        />
      </View>

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

      {selectedSports.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Skill Level for Each Sport</Text>
          <Text style={styles.hint}>Set your skill level per sport</Text>
          <View style={styles.skillsList}>
            {selectedSports.map((sport) => {
              const level = sportSkills[sport] ?? 'beginner';
              return (
                <View key={sport} style={styles.sportSkillRow}>
                  <View style={styles.sportSkillLabel}>
                    <Text style={styles.sportSkillEmoji}>{SPORT_EMOJI[sport]}</Text>
                    <Text style={styles.sportSkillName}>{SPORT_LABELS[sport]}</Text>
                  </View>
                  <View style={styles.skillPickerRow}>
                    {SKILL_LEVELS.map((l) => (
                      <TouchableOpacity
                        key={l}
                        style={[
                          styles.skillPickerBtn,
                          level === l && {
                            backgroundColor: `${SKILL_COLORS[l]}30`,
                            borderColor: SKILL_COLORS[l],
                          },
                        ]}
                        onPress={() => setSportSkillLevel(sport, l)}
                      >
                        <Text
                          style={[
                            styles.skillPickerText,
                            level === l && { color: SKILL_COLORS[l], fontWeight: '700' },
                          ]}
                        >
                          {l.charAt(0).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

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
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  avatarSection: { alignItems: 'center', marginBottom: spacing['2xl'] },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bg.surface,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.accent.lime, fontSize: 14, fontWeight: '500', marginTop: spacing.sm },
  inputGroup: { marginBottom: spacing.xl },
  label: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500', marginBottom: spacing.sm },
  hint: { color: colors.text.muted, fontSize: 13, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
  },
  section: { marginBottom: spacing.xl },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipSelected: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 16 },
  chipText: { color: colors.text.secondary, fontSize: 14 },
  chipTextSelected: { color: colors.accent.lime, fontWeight: '600' },
  skillsList: { gap: spacing.sm },
  sportSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sportSkillLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  sportSkillEmoji: { fontSize: 20 },
  sportSkillName: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  skillPickerRow: { flexDirection: 'row', gap: 4 },
  skillPickerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  skillPickerText: { color: colors.text.muted, fontSize: 12, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  locationText: { color: colors.text.primary, fontSize: 15 },
  completeButton: {
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  completeButtonText: { ...typography.button, color: colors.bg.primary },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth';
import { storageService } from '../../services/storage';
import { SportType, SkillLevel } from '../../types/database.types';
import { SPORT_LIST, SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { getInitial } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'pro'];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);
  const loadUserProfile = useAuthStore((s) => s.loadUserProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [sports, setSports] = useState<SportType[]>(user?.sports ?? []);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(user?.skill_level ?? 'beginner');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };

  const toggleSport = (sport: SportType) => {
    setSports((prev) => prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let avatarUrl = user.avatar_url;
      if (avatarUri) {
        avatarUrl = await storageService.uploadAvatar(user.id, avatarUri);
      }
      await authService.updateProfile(user.id, { name, bio, sports, skill_level: skillLevel, avatar_url: avatarUrl });
      await loadUserProfile();
      navigation.goBack();
    } catch { /* handle error */ }
    setIsLoading(false);
  };

  const displayAvatar = avatarUri ?? user?.avatar_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(name) }]}>
              <Text style={styles.avatarInitial}>{getInitial(name)}</Text>
            </View>
          )}
          <Text style={styles.changePhoto}>{t('edit.changePhoto')}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t('edit.name')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.text.muted} />

        <Text style={styles.label}>{t('edit.bio')}</Text>
        <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder={t('edit.bioPlaceholder')} placeholderTextColor={colors.text.muted} multiline numberOfLines={3} textAlignVertical="top" maxLength={300} />

        <Text style={styles.label}>{t('edit.sports')}</Text>
        <View style={styles.chipsGrid}>
          {SPORT_LIST.map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, sports.includes(s) && styles.chipActive]} onPress={() => toggleSport(s)}>
              <Text style={styles.chipEmoji}>{SPORT_EMOJI[s]}</Text>
              <Text style={[styles.chipText, sports.includes(s) && styles.chipTextActive]}>{SPORT_LABELS[s]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('edit.skillLevel')}</Text>
        <View style={styles.skillRow}>
          {SKILL_LEVELS.map((l) => (
            <TouchableOpacity key={l} style={[styles.skillPill, skillLevel === l && styles.skillPillActive]} onPress={() => setSkillLevel(l)}>
              <Text style={[styles.skillText, skillLevel === l && styles.skillTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveButton, isLoading && styles.buttonDisabled]} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.bg.primary} /> : <Text style={styles.saveButtonText}>{t('common:save')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: colors.bg.primary, fontSize: 38, fontWeight: '700' },
  changePhoto: { color: colors.accent.lime, fontSize: 14, fontWeight: '500', marginTop: spacing.sm },
  label: { color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  textArea: { minHeight: 80, paddingTop: spacing.md },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  chipActive: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 14 },
  chipText: { color: colors.text.secondary, fontSize: 13 },
  chipTextActive: { color: colors.accent.lime, fontWeight: '600' },
  skillRow: { flexDirection: 'row', gap: spacing.sm },
  skillPill: { flex: 1, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.default },
  skillPillActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  skillText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  skillTextActive: { color: colors.bg.primary },
  saveButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', marginTop: spacing['2xl'] },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { ...typography.button, color: colors.bg.primary },
});

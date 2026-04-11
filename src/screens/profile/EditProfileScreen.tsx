import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Image, Alert,
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
const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: '#3B82F6',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  pro: '#8B5CF6',
};

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);
  const loadUserProfile = useAuthStore((s) => s.loadUserProfile);

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [age, setAge] = useState(user?.age?.toString() ?? '');
  const [education, setEducation] = useState(user?.education ?? '');
  const [sports, setSports] = useState<SportType[]>(user?.sports ?? []);
  const [sportSkills, setSportSkills] = useState<Record<string, SkillLevel>>(
    (user?.sport_skills as Record<string, SkillLevel> | null) ?? {}
  );
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [newInterest, setNewInterest] = useState('');
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access in settings');
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
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access in settings');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleSport = (sport: SportType) => {
    setSports((prev) => {
      if (prev.includes(sport)) {
        // Remove from sports and sportSkills
        const { [sport]: _, ...rest } = sportSkills;
        setSportSkills(rest);
        return prev.filter((s) => s !== sport);
      } else {
        // Add with default skill level
        setSportSkills({ ...sportSkills, [sport]: 'beginner' });
        return [...prev, sport];
      }
    });
  };

  const setSportSkill = (sport: SportType, level: SkillLevel) => {
    setSportSkills((prev) => ({ ...prev, [sport]: level }));
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed) return;
    if (interests.includes(trimmed)) return;
    setInterests([...interests, trimmed]);
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setIsLoading(true);
    try {
      let avatarUrl = user.avatar_url;
      if (avatarUri) {
        try {
          avatarUrl = await storageService.uploadAvatar(user.id, avatarUri);
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr);
          Alert.alert(
            'Photo upload failed',
            'Could not upload profile picture. Make sure the "synk-avatars" bucket exists in Supabase Storage. Saving other profile changes...'
          );
        }
      }

      // Upload any new local photos (local file URIs start with file:// or content://)
      const uploadedPhotos: string[] = [];
      for (const photo of photos) {
        if (photo.startsWith('http')) {
          // Already uploaded
          uploadedPhotos.push(photo);
        } else {
          try {
            const url = await storageService.uploadPhoto(user.id, photo);
            uploadedPhotos.push(url);
          } catch (uploadErr) {
            console.warn('Photo upload failed for one photo:', uploadErr);
            // Skip this one
          }
        }
      }

      const parsedAge = parseInt(age, 10);
      await authService.updateProfile(user.id, {
        name: name.trim(),
        bio: bio.trim() || null,
        age: !isNaN(parsedAge) ? parsedAge : null,
        education: education.trim() || null,
        sports,
        sport_skills: sportSkills,
        interests,
        photos: uploadedPhotos,
        avatar_url: avatarUrl,
      });
      await loadUserProfile();
      setIsLoading(false);
      navigation.goBack();
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Error', (err as Error)?.message ?? 'Failed to save profile');
    }
  };

  const displayAvatar = avatarUri ?? user?.avatar_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit.title')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.accent.lime} size="small" />
          ) : (
            <Text style={styles.saveLink}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarSection} onPress={pickAvatar}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(name) }]}>
              <Text style={styles.avatarInitial}>{getInitial(name || '?')}</Text>
            </View>
          )}
          <Text style={styles.changePhoto}>{t('edit.changePhoto')}</Text>
        </TouchableOpacity>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.text.muted} maxLength={50} />

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
          placeholder="Your age"
          placeholderTextColor={colors.text.muted}
          keyboardType="number-pad"
          maxLength={3}
        />

        {/* Education */}
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={setEducation}
          placeholder="e.g. University of Helsinki - Computer Science"
          placeholderTextColor={colors.text.muted}
          maxLength={100}
        />

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder={t('edit.bioPlaceholder')}
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />

        {/* Photos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Photos ({photos.length}/9)</Text>
          {photos.length < 9 && (
            <TouchableOpacity onPress={addPhoto} style={styles.addPhotoBtn}>
              <Ionicons name="add" size={16} color={colors.accent.lime} />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.photosGrid}>
          {photos.map((photo, idx) => (
            <View key={`${photo}-${idx}`} style={styles.photoWrap}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(idx)}>
                <Ionicons name="close" size={14} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Sports with Skill Levels */}
        <Text style={styles.label}>Sports & Skill Level</Text>
        <Text style={styles.hint}>Select sports you play and set your skill level for each</Text>
        <View style={styles.chipsGrid}>
          {SPORT_LIST.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, sports.includes(s) && styles.chipActive]}
              onPress={() => toggleSport(s)}
            >
              <Text style={styles.chipEmoji}>{SPORT_EMOJI[s]}</Text>
              <Text style={[styles.chipText, sports.includes(s) && styles.chipTextActive]}>
                {SPORT_LABELS[s]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {sports.length > 0 && (
          <View style={styles.sportSkillsSection}>
            {sports.map((sport) => {
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
                        onPress={() => setSportSkill(sport, l)}
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
        )}

        {/* Interests */}
        <Text style={styles.label}>Interests</Text>
        <View style={styles.interestInputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={newInterest}
            onChangeText={setNewInterest}
            placeholder="Add an interest"
            placeholderTextColor={colors.text.muted}
            onSubmitEditing={addInterest}
            returnKeyType="done"
            maxLength={30}
          />
          <TouchableOpacity style={styles.addInterestBtn} onPress={addInterest}>
            <Ionicons name="add" size={22} color={colors.bg.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.interestsRow}>
          {interests.map((interest) => (
            <View key={interest} style={styles.interestPill}>
              <Text style={styles.interestText}>{interest}</Text>
              <TouchableOpacity onPress={() => removeInterest(interest)}>
                <Ionicons name="close" size={14} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bg.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  saveLink: { color: colors.accent.lime, fontSize: 15, fontWeight: '700' },
  content: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: colors.bg.primary, fontSize: 42, fontWeight: '800' },
  changePhoto: { color: colors.accent.lime, fontSize: 14, fontWeight: '600', marginTop: spacing.sm },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hint: { color: colors.text.muted, fontSize: 12, marginBottom: spacing.md, marginTop: -spacing.sm },
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
  textArea: { minHeight: 80, paddingTop: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  addPhotoText: { color: colors.accent.lime, fontSize: 13, fontWeight: '600' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrap: { position: 'relative' },
  photo: { width: 90, height: 110, borderRadius: 12, backgroundColor: colors.bg.surface },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  sportSkillsSection: {
    marginTop: spacing.base,
    gap: spacing.sm,
  },
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
  interestInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  addInterestBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  interestPill: {
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
  interestText: { color: colors.text.primary, fontSize: 13 },
  saveButton: {
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});

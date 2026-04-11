import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth';
import { SportType, SkillLevel } from '../../types/database.types';
import { SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { getInitial, formatDate } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 48 - 16) / 3;

const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: '#3B82F6',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  pro: '#8B5CF6',
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not logged in</Text>
      </View>
    );
  }

  const sportSkills = (user.sport_skills as Record<string, SkillLevel> | null) ?? {};
  const interests = user.interests ?? [];
  const photos = user.photos ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(user.name) }]}>
              <Text style={styles.avatarInitial}>{getInitial(user.name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}{user.age ? `, ${user.age}` : ''}</Text>
          <Text style={styles.location}>{user.location_name}</Text>
          {user.education && <Text style={styles.education}>🎓 {user.education}</Text>}
          <Text style={styles.memberSince}>{t('memberSince', { date: formatDate(user.created_at) })}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={18} color={colors.bg.primary} />
          <Text style={styles.editButtonText}>{t('editProfile')}</Text>
        </TouchableOpacity>

        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('bio')}</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {photos.slice(0, 9).map((photo, idx) => (
                <Image key={`${photo}-${idx}`} source={{ uri: photo }} style={styles.photo} />
              ))}
            </View>
          </View>
        )}

        {/* Sports with skill levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports & Skill Levels</Text>
          {(user.sports ?? []).length === 0 ? (
            <Text style={styles.emptyHint}>No sports added yet. Edit profile to add some.</Text>
          ) : (
            <View style={styles.sportsCards}>
              {(user.sports ?? []).map((sport) => {
                const level = sportSkills[sport] ?? user.skill_level ?? 'beginner';
                const skillColor = SKILL_COLORS[level] ?? colors.text.muted;
                return (
                  <View key={sport} style={styles.sportCard}>
                    <Text style={styles.sportCardEmoji}>
                      {SPORT_EMOJI[sport as SportType] ?? '🤸'}
                    </Text>
                    <View style={styles.sportCardInfo}>
                      <Text style={styles.sportCardName}>
                        {SPORT_LABELS[sport as SportType] ?? sport}
                      </Text>
                      <View style={[styles.sportCardLevel, { backgroundColor: `${skillColor}20`, borderColor: skillColor }]}>
                        <Text style={[styles.sportCardLevelText, { color: skillColor }]}>
                          {level}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Interests */}
        {interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsRow}>
              {interests.map((interest) => (
                <View key={interest} style={styles.interestPill}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.navLinks}>
          <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color={colors.text.primary} />
            <Text style={styles.navLinkText}>{t('settings')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('About')}>
            <Ionicons name="information-circle-outline" size={20} color={colors.text.primary} />
            <Text style={styles.navLinkText}>{t('about')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  emptyContainer: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.text.muted, fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] + 80 },
  profileSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: spacing.md },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: { color: colors.bg.primary, fontSize: 42, fontWeight: '800' },
  name: { ...typography.h1, color: colors.text.primary },
  location: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  education: { color: colors.accent.lime, fontSize: 14, marginTop: spacing.xs },
  memberSince: { color: colors.text.muted, fontSize: 12, marginTop: spacing.xs },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  editButtonText: { color: colors.bg.primary, fontSize: 15, fontWeight: '700' },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  bioText: { color: colors.text.primary, fontSize: 15, lineHeight: 22 },
  emptyHint: { color: colors.text.muted, fontSize: 14, fontStyle: 'italic' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 12, backgroundColor: colors.bg.surface },
  sportsCards: { gap: spacing.sm },
  sportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sportCardEmoji: { fontSize: 28 },
  sportCardInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sportCardName: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  sportCardLevel: {
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  sportCardLevelText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestPill: {
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  interestText: { color: colors.text.primary, fontSize: 13 },
  navLinks: { gap: spacing.sm, marginTop: spacing.xl },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  navLinkText: { flex: 1, color: colors.text.primary, fontSize: 16 },
});

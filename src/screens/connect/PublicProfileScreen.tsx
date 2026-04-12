import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { usePublicProfile } from '../../hooks/useConnections';
import { useAuthStore } from '../../store/auth';
import { useConnectionsStore } from '../../store/connections';
import { SportType, SkillLevel } from '../../types/database.types';
import { SPORT_EMOJI, SPORT_LABELS } from '../../types/event.types';
import { getInitial } from '../../utils/formatters';
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

export const PublicProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PublicProfile'>>();
  const { t } = useTranslation(['connect', 'profile', 'common']);
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading } = usePublicProfile(route.params?.userId ?? '');
  const sendConnectionRequest = useConnectionsStore((s) => s.sendConnectionRequest);

  if (isLoading || !profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.lime} />
      </View>
    );
  }

  const [connectStatus, setConnectStatus] = useState(profile.connection_status);

  const handleConnect = async () => {
    if (!user) return;
    try {
      await sendConnectionRequest(user.id, profile.id);
      setConnectStatus('pending_sent');
    } catch (err) {
      console.warn('Failed to send connection request:', err);
    }
  };

  const sportSkills = (profile.sport_skills as Record<string, SkillLevel> | null) ?? {};
  const interests = profile.interests ?? [];
  const photos = profile.photos ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(profile.name) }]}>
              <Text style={styles.avatarInitial}>{getInitial(profile.name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name}{profile.age ? `, ${profile.age}` : ''}</Text>
          <Text style={styles.location}>{profile.location_name}</Text>
          {profile.education && <Text style={styles.education}>🎓 {profile.education}</Text>}
        </View>

        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.events_created_count}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.connections_count}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
        </View>

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
          {(profile.sports ?? []).length === 0 ? (
            <Text style={styles.emptyHint}>No sports added yet</Text>
          ) : (
            <View style={styles.sportsCards}>
              {(profile.sports ?? []).map((sport) => {
                const level = sportSkills[sport] ?? profile.skill_level ?? 'beginner';
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
                      <View
                        style={[
                          styles.sportCardLevel,
                          { backgroundColor: `${skillColor}20`, borderColor: skillColor },
                        ]}
                      >
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

        {/* Actions */}
        {profile.id !== user?.id && (
          <View style={styles.actions}>
            {connectStatus === 'none' && (
              <TouchableOpacity style={styles.connectButton} onPress={handleConnect} activeOpacity={0.8}>
                <Ionicons name="person-add-outline" size={18} color={colors.bg.primary} />
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            )}
            {connectStatus === 'pending_sent' && (
              <View style={styles.pendingButton}>
                <Text style={styles.pendingText}>Request Sent</Text>
              </View>
            )}
            {connectStatus === 'accepted' && (
              <>
                <View style={styles.connectedButton}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() =>
                    navigation.navigate('DirectMessage', {
                      userId: profile.id,
                      userName: profile.name,
                    })
                  }
                >
                  <Ionicons name="chatbubble-outline" size={18} color={colors.accent.lime} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loading: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: spacing.md },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: { color: colors.bg.primary, fontSize: 48, fontWeight: '800' },
  name: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  location: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  education: { color: colors.accent.lime, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
  bio: { color: colors.text.secondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: spacing.xl },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border.subtle },
  statValue: { color: colors.accent.lime, fontSize: 24, fontWeight: '700' },
  statLabel: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
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
  sportCardLevel: { borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1 },
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
  actions: { gap: spacing.md },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.base,
  },
  connectButtonText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  pendingButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pendingText: { color: colors.text.secondary, fontSize: 16, fontWeight: '600' },
  connectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 9999,
    paddingVertical: spacing.base,
  },
  connectedText: { color: colors.success, fontSize: 16, fontWeight: '600' },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  messageButtonText: { color: colors.accent.lime, fontSize: 16, fontWeight: '600' },
});

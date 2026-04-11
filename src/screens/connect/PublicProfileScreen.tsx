import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { usePublicProfile } from '../../hooks/useConnections';
import { useAuthStore } from '../../store/auth';
import { useConnectionsStore } from '../../store/connections';
import { getInitial } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const PublicProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PublicProfile'>>();
  const { t } = useTranslation(['connect', 'profile', 'common']);
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading } = usePublicProfile(route.params.userId);
  const sendConnectionRequest = useConnectionsStore((s) => s.sendConnectionRequest);

  if (isLoading || !profile) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={colors.accent.lime} /></View>;
  }

  const handleConnect = () => {
    if (user) sendConnectionRequest(user.id, profile.id);
  };

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
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.location}>{profile.location_name}</Text>
        </View>

        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.events_created_count}</Text>
            <Text style={styles.statLabel}>{t('connect:publicProfile.events')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.connections_count}</Text>
            <Text style={styles.statLabel}>{t('connect:publicProfile.connections')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('connect:publicProfile.sports')}</Text>
        <View style={styles.sportsRow}>
          {(profile.sports ?? []).map((sport) => (
            <View key={sport} style={styles.sportPill}>
              <Text style={styles.sportText}>{sport}</Text>
            </View>
          ))}
        </View>

        <View style={styles.skillRow}>
          <Text style={styles.skillLabel}>{t('profile:skillLevel')}</Text>
          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>{profile.skill_level}</Text>
          </View>
        </View>

        {/* Actions */}
        {profile.id !== user?.id && (
          <View style={styles.actions}>
            {profile.connection_status === 'none' && (
              <TouchableOpacity style={styles.connectButton} onPress={handleConnect} activeOpacity={0.8}>
                <Ionicons name="person-add-outline" size={18} color={colors.bg.primary} />
                <Text style={styles.connectButtonText}>{t('connect:connect')}</Text>
              </TouchableOpacity>
            )}
            {profile.connection_status === 'pending_sent' && (
              <View style={styles.pendingButton}><Text style={styles.pendingText}>{t('connect:pending')}</Text></View>
            )}
            {profile.connection_status === 'accepted' && (
              <View style={styles.connectedButton}><Text style={styles.connectedText}>{t('connect:connected')}</Text></View>
            )}
            {profile.is_connected && (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => navigation.navigate('DirectMessage', { userId: profile.id, userName: profile.name })}
              >
                <Ionicons name="chatbubble-outline" size={18} color={colors.accent.lime} />
                <Text style={styles.messageButtonText}>{t('connect:message')}</Text>
              </TouchableOpacity>
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
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'], alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: spacing.md },
  avatarFallback: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarInitial: { color: colors.bg.primary, fontSize: 40, fontWeight: '700' },
  name: { ...typography.h1, color: colors.text.primary },
  location: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  bio: { color: colors.text.secondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing['2xl'], marginBottom: spacing.xl },
  statItem: { alignItems: 'center' },
  statValue: { color: colors.accent.lime, fontSize: 24, fontWeight: '700' },
  statLabel: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md, alignSelf: 'flex-start' },
  sportsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl, alignSelf: 'flex-start' },
  sportPill: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  sportText: { color: colors.text.primary, fontSize: 13, textTransform: 'capitalize' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl, alignSelf: 'flex-start' },
  skillLabel: { color: colors.text.secondary, fontSize: 14 },
  skillBadge: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  skillText: { color: colors.bg.primary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  actions: { gap: spacing.md, width: '100%' },
  connectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base },
  connectButtonText: { ...typography.button, color: colors.bg.primary },
  pendingButton: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', borderWidth: 1, borderColor: colors.border.default },
  pendingText: { color: colors.text.secondary, fontSize: 16, fontWeight: '600' },
  connectedButton: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  connectedText: { color: colors.success, fontSize: 16, fontWeight: '600' },
  messageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.base, borderWidth: 1, borderColor: colors.accent.lime },
  messageButtonText: { color: colors.accent.lime, fontSize: 16, fontWeight: '600' },
});

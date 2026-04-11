import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useConnections } from '../../hooks/useConnections';
import { useAuthStore } from '../../store/auth';
import { CONNECT_FILTERS } from '../../types/connection.types';
import { SYNK_TEAM } from '../../types/user.types';
import { PublicProfile } from '../../types/user.types';
import { getInitial } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const ConnectScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['connect', 'common']);
  const user = useAuthStore((s) => s.user);
  const { members, filter, setFilter, fetchMembers, sendConnectionRequest, isLoading, refresh } = useConnections();

  const handleConnect = (memberId: string) => {
    if (user) sendConnectionRequest(user.id, memberId);
  };

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('connect:title')} </Text>
        <Text style={styles.titleAccent}>{t('connect:titleAccent')}</Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        {CONNECT_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.type}
            style={[styles.filterPill, filter === f.type && styles.filterPillActive]}
            onPress={() => { setFilter(filter === f.type ? null : f.type); fetchMembers(filter === f.type ? null : f.type); }}
            activeOpacity={0.8}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[styles.filterText, filter === f.type && styles.filterTextActive]}>
              {t(`connect:filters.${f.type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Team Members */}
      <Text style={styles.sectionTitle}>{t('connect:featured')}</Text>
      {SYNK_TEAM.map((member) => (
        <View key={member.email} style={styles.memberCard}>
          <View style={styles.memberHeader}>
            <View style={[styles.memberAvatar, { backgroundColor: getAvatarColor(member.name) }]}>
              <Text style={styles.memberInitial}>{member.initial}</Text>
            </View>
            <View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
          <View style={styles.contactRows}>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={16} color={colors.accent.lime} />
              <Text style={styles.contactText}>{member.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={16} color={colors.accent.lime} />
              <Text style={styles.contactText}>{member.phone}</Text>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t('connect:members')}</Text>
    </View>
  );

  const renderMember = ({ item }: { item: PublicProfile }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => navigation.navigate('PublicProfile', { userId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.memberHeader}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.memberAvatarImg} />
        ) : (
          <View style={[styles.memberAvatar, { backgroundColor: getAvatarColor(item.name ?? '') }]}>
            <Text style={styles.memberInitial}>{getInitial(item.name ?? '?')}</Text>
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name ?? ''}</Text>
          <Text style={styles.memberRole}>{(item.sports && item.sports.length > 0) ? item.sports.join(', ') : (item.location_name ?? '')}</Text>
        </View>
        {item.connection_status === 'none' && item.id !== user?.id && (
          <TouchableOpacity style={styles.connectBtn} onPress={() => handleConnect(item.id)}>
            <Text style={styles.connectBtnText}>{t('connect:connect')}</Text>
          </TouchableOpacity>
        )}
        {item.connection_status === 'pending_sent' && (
          <View style={styles.pendingBadge}><Text style={styles.pendingText}>{t('connect:pending')}</Text></View>
        )}
        {item.connection_status === 'accepted' && (
          <View style={styles.connectedBadge}><Text style={styles.connectedText}>{t('connect:connected')}</Text></View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>{t('connect:noMembers')}</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent.lime} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text.primary },
  titleAccent: { ...typography.h1, color: colors.accent.lime },
  filterSection: { gap: spacing.sm, marginBottom: spacing['2xl'] },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  filterPillActive: { borderColor: colors.accent.lime, backgroundColor: 'rgba(197,241,53,0.08)' },
  filterEmoji: { fontSize: 18 },
  filterText: { color: colors.text.primary, fontSize: 15 },
  filterTextActive: { color: colors.accent.lime, fontWeight: '600' },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md, marginTop: spacing.xl },
  memberCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  memberAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  memberAvatarImg: { width: 52, height: 52, borderRadius: 26 },
  memberInitial: { color: colors.bg.primary, fontSize: 22, fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { color: colors.text.primary, fontSize: 17, fontWeight: '700' },
  memberRole: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
  contactRows: { marginTop: spacing.md, gap: spacing.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.elevated, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  contactText: { color: colors.text.primary, fontSize: 14 },
  connectBtn: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  connectBtnText: { color: colors.bg.primary, fontSize: 13, fontWeight: '600' },
  pendingBadge: { backgroundColor: colors.bg.elevated, borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  pendingText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  connectedBadge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  connectedText: { color: colors.success, fontSize: 13, fontWeight: '600' },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.base },
});

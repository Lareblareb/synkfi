import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth';
import { getInitial, formatDate } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
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
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.location}>{user.location_name}</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sports')}</Text>
          <View style={styles.sportsRow}>
            {(user.sports ?? []).map((sport) => (
              <View key={sport} style={styles.sportPill}>
                <Text style={styles.sportText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('skillLevel')}</Text>
          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>{user.skill_level}</Text>
          </View>
        </View>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  profileSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
  avatarFallback: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarInitial: { color: colors.bg.primary, fontSize: 38, fontWeight: '700' },
  name: { ...typography.h1, color: colors.text.primary },
  location: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  memberSince: { color: colors.text.muted, fontSize: 12, marginTop: spacing.xs },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.md, marginBottom: spacing.xl },
  editButtonText: { color: colors.bg.primary, fontSize: 15, fontWeight: '600' },
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.text.secondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  bioText: { color: colors.text.primary, fontSize: 15, lineHeight: 22 },
  sportsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sportPill: { backgroundColor: colors.bg.surface, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
  sportText: { color: colors.text.primary, fontSize: 13, textTransform: 'capitalize' },
  skillBadge: { alignSelf: 'flex-start', backgroundColor: colors.accent.lime, borderRadius: 9999, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  skillText: { color: colors.bg.primary, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  navLinks: { gap: spacing.sm },
  navLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 12, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  navLinkText: { flex: 1, color: colors.text.primary, fontSize: 16 },
});

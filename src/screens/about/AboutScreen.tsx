import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('about');

  const pillars = ['playFirst', 'inclusive', 'community', 'wellbeing'] as const;
  const activities = ['sportNetworking', 'matchmaking', 'gameNights', 'tournaments', 'orgCollabs', 'campusActivations'] as const;
  const collabItems = ['coHosted', 'campusActivations', 'brandPartnerships', 'communityDriven'] as const;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.logo}>SYNK</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t('heroTitle')} <Text style={styles.heroAccent}>{t('heroTitleAccent')}</Text></Text>
          <Text style={styles.mission}>{t('mission')}</Text>
        </View>

        {/* Pull Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{t('pullQuote')}"</Text>
        </View>

        {/* Brand Pillars */}
        <Text style={styles.sectionTitle}>{t('pillarsTitle')}</Text>
        <View style={styles.pillarsGrid}>
          {pillars.map((key) => (
            <View key={key} style={styles.pillarCard}>
              <Text style={styles.pillarEmoji}>{t(`pillars.${key}.emoji`)}</Text>
              <Text style={styles.pillarTitle}>{t(`pillars.${key}.title`)}</Text>
              <Text style={styles.pillarDescription}>{t(`pillars.${key}.description`)}</Text>
            </View>
          ))}
        </View>

        {/* Activities */}
        <View style={styles.activitiesTitleRow}>
          <Text style={styles.sectionTitle}>{t('activitiesTitle')} </Text>
          <Text style={styles.sectionTitleAccent}>{t('activitiesTitleAccent')}</Text>
        </View>
        <View style={styles.activitiesGrid}>
          {activities.map((key) => (
            <View key={key} style={styles.activityCard}>
              <Text style={styles.activityEmoji}>{t(`activities.${key}.emoji`)}</Text>
              <Text style={styles.activityTitle}>{t(`activities.${key}.title`)}</Text>
              <Text style={styles.activityDescription}>{t(`activities.${key}.description`)}</Text>
            </View>
          ))}
        </View>

        {/* Collaboration */}
        <View style={styles.collabSection}>
          <Text style={styles.collabTitle}>{t('collabTitle')} <Text style={styles.heroAccent}>{t('collabTitleAccent')}</Text></Text>
          <View style={styles.collabGrid}>
            {collabItems.map((key) => (
              <View key={key} style={styles.collabCard}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent.lime} />
                <Text style={styles.collabText}>{t(`collabItems.${key}`)}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.ctaButton} onPress={() => Linking.openURL('mailto:handoan6@gmail.com')} activeOpacity={0.8}>
            <Text style={styles.ctaButtonText}>{t('letsTalk')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>SYNK</Text>
          <Text style={styles.footerTagline}>{t('footer.tagline')}</Text>
          <View style={styles.footerLinks}>
            {(['about', 'ourTeam', 'events', 'collaboration', 'contact'] as const).map((link) => (
              <Text key={link} style={styles.footerLink}>{t(`common:footer.${link}`)}</Text>
            ))}
          </View>
          <Text style={styles.footerNote}>{t('footer.bottomNote')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  heroSection: { marginBottom: spacing['2xl'] },
  heroTitle: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.xl, lineHeight: 40 },
  heroAccent: { color: colors.accent.lime },
  mission: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },
  quoteCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.xl, marginBottom: spacing['2xl'], borderLeftWidth: 3, borderLeftColor: colors.accent.lime },
  quoteText: { color: colors.accent.lime, fontSize: 18, fontWeight: '600', fontStyle: 'italic', lineHeight: 26 },
  sectionTitle: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.base },
  sectionTitleAccent: { ...typography.h2, color: colors.accent.lime },
  pillarsGrid: { gap: spacing.md, marginBottom: spacing['2xl'] },
  pillarCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, borderWidth: 1, borderColor: colors.border.subtle },
  pillarEmoji: { fontSize: 28, marginBottom: spacing.sm },
  pillarTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm },
  pillarDescription: { color: colors.text.secondary, fontSize: 14, lineHeight: 20 },
  activitiesTitleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.base },
  activitiesGrid: { gap: spacing.md, marginBottom: spacing['2xl'] },
  activityCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, borderWidth: 1, borderColor: colors.border.subtle },
  activityEmoji: { fontSize: 24, marginBottom: spacing.sm },
  activityTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  activityDescription: { color: colors.text.secondary, fontSize: 14, lineHeight: 20 },
  collabSection: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.xl, marginBottom: spacing['2xl'] },
  collabTitle: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },
  collabGrid: { gap: spacing.md, marginBottom: spacing.xl },
  collabCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  collabText: { color: colors.text.primary, fontSize: 15 },
  ctaButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  ctaButtonText: { ...typography.button, color: colors.bg.primary },
  footer: { alignItems: 'center', paddingTop: spacing['2xl'], borderTopWidth: 1, borderTopColor: colors.border.subtle },
  footerLogo: { fontSize: 28, fontWeight: '800', color: colors.text.primary, letterSpacing: 2, marginBottom: spacing.sm },
  footerTagline: { color: colors.text.secondary, fontSize: 14, marginBottom: spacing.xl },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.base, marginBottom: spacing.xl },
  footerLink: { color: colors.text.muted, fontSize: 13 },
  footerNote: { color: colors.text.muted, fontSize: 12, textAlign: 'center' },
});

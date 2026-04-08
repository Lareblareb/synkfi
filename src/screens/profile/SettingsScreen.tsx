import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { language, setLanguage, pushEnabled, togglePush, eventReminders, toggleEventReminders, chatMessages, toggleChatMessages, connectionRequests, toggleConnectionRequests, nearbyEvents, toggleNearbyEvents } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('settings.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity style={[styles.langBtn, language === 'en' && styles.langBtnActive]} onPress={() => setLanguage('en', user?.id)}>
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>{t('settings.english')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.langBtn, language === 'fi' && styles.langBtnActive]} onPress={() => setLanguage('fi', user?.id)}>
            <Text style={[styles.langText, language === 'fi' && styles.langTextActive]}>{t('settings.finnish')}</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <View style={styles.settingsList}>
          <SettingRow label={t('settings.pushNotifications')} value={pushEnabled} onToggle={togglePush} />
          <SettingRow label={t('settings.eventReminders')} value={eventReminders} onToggle={toggleEventReminders} />
          <SettingRow label={t('settings.chatMessages')} value={chatMessages} onToggle={toggleChatMessages} />
          <SettingRow label={t('settings.connectionRequests')} value={connectionRequests} onToggle={toggleConnectionRequests} />
          <SettingRow label={t('settings.nearbyEvents')} value={nearbyEvents} onToggle={toggleNearbyEvents} />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.changePassword')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
            <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>{t('settings.version')} 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const SettingRow: React.FC<{ label: string; value: boolean; onToggle: () => void }> = ({ label, value, onToggle }) => (
  <View style={settingStyles.row}>
    <Text style={settingStyles.label}>{label}</Text>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.bg.elevated, true: colors.accent.lime }} thumbColor={colors.text.primary} />
  </View>
);

const settingStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  label: { color: colors.text.primary, fontSize: 15 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  sectionTitle: { color: colors.text.secondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing['2xl'], marginBottom: spacing.md },
  langToggle: { flexDirection: 'row', backgroundColor: colors.bg.surface, borderRadius: 9999, padding: 3 },
  langBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: 9999, alignItems: 'center' },
  langBtnActive: { backgroundColor: colors.accent.lime },
  langText: { color: colors.text.secondary, fontSize: 15, fontWeight: '500' },
  langTextActive: { color: colors.bg.primary, fontWeight: '700' },
  settingsList: { backgroundColor: colors.bg.surface, borderRadius: 16, paddingHorizontal: spacing.base },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  settingLabel: { color: colors.text.primary, fontSize: 15 },
  signOutRow: { paddingVertical: spacing.md, alignItems: 'center' },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
  version: { color: colors.text.muted, fontSize: 12, textAlign: 'center', marginTop: spacing['2xl'] },
});

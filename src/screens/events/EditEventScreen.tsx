import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEventsStore } from '../../store/events';
import { useAuthStore } from '../../store/auth';
import { eventsService } from '../../services/events';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const EditEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditEvent'>>();
  const { t } = useTranslation(['events', 'common']);
  const user = useAuthStore((s) => s.user);
  const { currentEvent } = useEventsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentEvent) {
      setTitle(currentEvent.title);
      setDescription(currentEvent.description ?? '');
    }
  }, [currentEvent]);

  const handleSave = async () => {
    if (!currentEvent) return;
    setIsLoading(true);
    try {
      await eventsService.updateEvent(currentEvent.id, {
        title: title.trim(),
        description: description.trim(),
      });
      navigation.goBack();
    } catch {
      // handle error
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('events:detail.edit')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('events:create.eventTitle')}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={colors.text.muted} />

        <Text style={styles.label}>{t('events:create.description')}</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" placeholderTextColor={colors.text.muted} />

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
  content: { padding: spacing.xl },
  label: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500', marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  textArea: { minHeight: 100, paddingTop: spacing.md },
  saveButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', marginTop: spacing['2xl'] },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { ...typography.button, color: colors.bg.primary },
});

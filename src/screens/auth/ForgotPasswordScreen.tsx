import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation('auth');
  const { resetPassword, isLoading } = useAuthStore();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>

        {sent ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.successText}>{t('forgotPassword.emailSent')}</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('forgotPassword.email')}</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && <Text style={styles.fieldError}>{t('forgotPassword.invalidEmail')}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.bg.primary} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('forgotPassword.sendLink')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t('forgotPassword.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { flex: 1, padding: spacing.xl, paddingTop: spacing['4xl'] },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['2xl'] },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 12, padding: spacing.base, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  successText: { color: colors.success, fontSize: 14, flex: 1 },
  form: { gap: spacing.base },
  inputGroup: { gap: spacing.sm },
  label: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500' },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12 },
  primaryButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { ...typography.button, color: colors.bg.primary },
  backLink: { marginTop: spacing['2xl'], alignItems: 'center' },
  backLinkText: { color: colors.accent.lime, fontSize: 14, fontWeight: '600' },
});

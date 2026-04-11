import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth';
import { signupSchema, SignupFormData } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export const SignupScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation('auth');
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    clearError();
    try {
      await signUp(data.email, data.password, data.name);
      navigation.navigate('ProfileSetup');
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    try {
      await authService.signInWithGoogle();
      await useAuthStore.getState().loadUserProfile();
    } catch (err) {
      console.warn('Google signup failed:', err);
    }
  };

  const handleAppleSignup = async () => {
    clearError();
    try {
      await authService.signInWithApple();
      await useAuthStore.getState().loadUserProfile();
    } catch (err) {
      console.warn('Apple signup failed:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>{t('signup.title')}</Text>
        <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{t('signup.signupFailed')}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('signup.name')}</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder={t('signup.namePlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.name && (
              <Text style={styles.fieldError}>{t('signup.nameRequired')}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('signup.email')}</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={t('signup.emailPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.fieldError}>{t('signup.invalidEmail')}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('signup.password')}</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder={t('signup.passwordPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
            />
            {errors.password && (
              <Text style={styles.fieldError}>
                {t('signup.passwordTooShort')}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('signup.confirmPassword')}</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder={t('signup.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.fieldError}>
                {t('signup.passwordsMismatch')}
              </Text>
            )}
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
              <Text style={styles.primaryButtonText}>
                {t('signup.createAccount')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('signup.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            activeOpacity={0.8}
            onPress={handleGoogleSignup}
          >
            <Ionicons
              name="logo-google"
              size={20}
              color={colors.text.primary}
            />
            <Text style={styles.socialButtonText}>{t('signup.google')}</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleAppleSignup}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={colors.text.primary}
              />
              <Text style={styles.socialButtonText}>{t('signup.apple')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('signup.hasAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}> {t('signup.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scrollContent: { flexGrow: 1, padding: spacing.xl, paddingTop: spacing['4xl'] },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['2xl'] },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: spacing.md, marginBottom: spacing.base },
  errorText: { color: colors.danger, fontSize: 14 },
  form: { gap: spacing.base },
  inputGroup: { gap: spacing.sm },
  label: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500' },
  input: { backgroundColor: colors.bg.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.base, paddingVertical: spacing.md, color: colors.text.primary, fontSize: 16 },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12 },
  primaryButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { ...typography.button, color: colors.bg.primary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.base },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.default },
  dividerText: { color: colors.text.muted, fontSize: 13, marginHorizontal: spacing.md },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 9999, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border.default },
  socialButtonText: { color: colors.text.primary, fontSize: 15, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing['2xl'], paddingBottom: spacing['2xl'] },
  footerText: { color: colors.text.secondary, fontSize: 14 },
  footerLink: { color: colors.accent.lime, fontSize: 14, fontWeight: '600' },
});

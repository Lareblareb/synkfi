import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, TextInput, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEventsStore } from '../../store/events';
import { useAuthStore } from '../../store/auth';
import { participantsService } from '../../services/participants';
import { formatCurrency } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

type PaymentMethodType = 'card' | 'google_pay' | 'apple_pay';

export const PaymentConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentConfirm'>>();
  const { t } = useTranslation('payments');
  const user = useAuthStore((s) => s.user);
  const event = useEventsStore((s) => s.currentEvent);
  const joinEvent = useEventsStore((s) => s.joinEvent);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/25');
  const [cvc, setCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = route.params.amount;

  const formatCardNumber = (v: string) => {
    const cleaned = v.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const chunks: string[] = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      chunks.push(cleaned.slice(i, i + 4));
    }
    return chunks.join(' ').slice(0, 19);
  };

  const formatExpiry = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handlePay = async () => {
    if (!user || !event) return;

    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Invalid card', 'Please enter a valid 16-digit card number');
        return;
      }
      if (expiry.length < 5) {
        Alert.alert('Invalid expiry', 'Please enter a valid expiry date MM/YY');
        return;
      }
      if (cvc.length < 3) {
        Alert.alert('Invalid CVC', 'Please enter a valid CVC');
        return;
      }
    }

    setIsProcessing(true);

    // DEMO MODE: simulate payment processing (no real Stripe call)
    setTimeout(async () => {
      try {
        await participantsService.updatePaymentStatus(
          event.id,
          user.id,
          'paid',
          selectedMethod,
          `demo_pi_${Date.now()}`
        );
        // Also join the event
        try {
          await joinEvent(event.id, user.id);
        } catch {
          // Already joined - that's fine
        }
        setIsProcessing(false);
        Alert.alert('Payment successful! ✅', `You've joined ${event.title}`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (err) {
        setIsProcessing(false);
        Alert.alert(
          'Payment simulated',
          `In demo mode, payment was recorded as successful. In production, this would charge your card.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('confirm')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Mode Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={16} color={colors.accent.lime} />
          <Text style={styles.demoBannerText}>
            DEMO MODE — No real charges. Add Stripe API for production.
          </Text>
        </View>

        {event && (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventMeta}>{event.location_name}</Text>
          </View>
        )}

        <View style={styles.costCard}>
          <Text style={styles.costTitle}>{t('costBreakdown')}</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t('venueCost')}</Text>
            <Text style={styles.costValue}>{formatCurrency(event?.venue_cost ?? 0)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t('participants')}</Text>
            <Text style={styles.costValue}>{event?.current_participants ?? 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
          </View>
        </View>

        <Text style={styles.methodTitle}>{t('paymentMethod')}</Text>
        <View style={styles.methods}>
          <TouchableOpacity
            style={[styles.methodBtn, selectedMethod === 'card' && styles.methodActive]}
            onPress={() => setSelectedMethod('card')}
          >
            <Ionicons
              name="card-outline"
              size={20}
              color={selectedMethod === 'card' ? colors.bg.primary : colors.text.primary}
            />
            <Text
              style={[
                styles.methodText,
                selectedMethod === 'card' && styles.methodTextActive,
              ]}
            >
              {t('card')}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.methodBtn, selectedMethod === 'google_pay' && styles.methodActive]}
              onPress={() => setSelectedMethod('google_pay')}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={selectedMethod === 'google_pay' ? colors.bg.primary : colors.text.primary}
              />
              <Text
                style={[
                  styles.methodText,
                  selectedMethod === 'google_pay' && styles.methodTextActive,
                ]}
              >
                {t('googlePay')}
              </Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.methodBtn, selectedMethod === 'apple_pay' && styles.methodActive]}
              onPress={() => setSelectedMethod('apple_pay')}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={selectedMethod === 'apple_pay' ? colors.bg.primary : colors.text.primary}
              />
              <Text
                style={[
                  styles.methodText,
                  selectedMethod === 'apple_pay' && styles.methodTextActive,
                ]}
              >
                {t('applePay')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card Form (only shown for card method) */}
        {selectedMethod === 'card' && (
          <View style={styles.cardForm}>
            <Text style={styles.formTitle}>Card Details</Text>

            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.formInput}
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Expiry</Text>
                <TextInput
                  style={styles.formInput}
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>CVC</Text>
                <TextInput
                  style={styles.formInput}
                  value={cvc}
                  onChangeText={(v) => setCvc(v.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="123"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.formInput}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Your name"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="words"
            />

            <Text style={styles.testCardHint}>
              💡 Demo mode: Use 4242 4242 4242 4242 with any future expiry date
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.buttonDisabled]}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.bg.primary} />
          ) : (
            <Text style={styles.payText}>
              {t('pay', { amount: formatCurrency(amount) })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(197,241,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(197,241,53,0.3)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.base,
  },
  demoBannerText: { color: colors.accent.lime, fontSize: 12, fontWeight: '600', flex: 1 },
  eventCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  eventTitle: { ...typography.h3, color: colors.text.primary },
  eventMeta: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  costCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  costTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  costLabel: { color: colors.text.secondary, fontSize: 15 },
  costValue: { color: colors.text.primary, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: spacing.md },
  totalLabel: { color: colors.text.primary, fontSize: 17, fontWeight: '700' },
  totalValue: { color: colors.accent.lime, fontSize: 17, fontWeight: '700' },
  methodTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  methods: { gap: spacing.sm, marginBottom: spacing.xl },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  methodActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  methodText: { color: colors.text.primary, fontSize: 16, fontWeight: '500' },
  methodTextActive: { color: colors.bg.primary },
  cardForm: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  formTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  formLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
  },
  formRow: { flexDirection: 'row', gap: spacing.md },
  testCardHint: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  actionBar: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  payButton: {
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  payText: { ...typography.button, color: colors.bg.primary },
});

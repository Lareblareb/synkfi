import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useEventsStore } from '../../store/events';
import { useAuthStore } from '../../store/auth';
import { usePayment } from '../../hooks/usePayment';
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
  const { payWithCard, payWithGooglePay, payWithApplePay, isProcessing } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');

  const amount = route.params.amount;

  const handlePay = async () => {
    if (!user || !event) return;
    let result;
    switch (selectedMethod) {
      case 'card':
        result = await payWithCard(event.id, user.id, amount);
        break;
      case 'google_pay':
        result = await payWithGooglePay(event.id, user.id, amount);
        break;
      case 'apple_pay':
        result = await payWithApplePay(event.id, user.id, amount);
        break;
    }
    if (result?.success) {
      navigation.goBack();
    }
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

      <View style={styles.content}>
        {event && (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventMeta}>{event.location_name}</Text>
          </View>
        )}

        <View style={styles.costCard}>
          <Text style={styles.costTitle}>{t('costBreakdown')}</Text>
          <View style={styles.costRow}><Text style={styles.costLabel}>{t('venueCost')}</Text><Text style={styles.costValue}>{formatCurrency(event?.venue_cost ?? 0)}</Text></View>
          <View style={styles.costRow}><Text style={styles.costLabel}>{t('participants')}</Text><Text style={styles.costValue}>{event?.current_participants ?? 0}</Text></View>
          <View style={styles.divider} />
          <View style={styles.costRow}><Text style={styles.totalLabel}>{t('total')}</Text><Text style={styles.totalValue}>{formatCurrency(amount)}</Text></View>
        </View>

        <Text style={styles.methodTitle}>{t('paymentMethod')}</Text>
        <View style={styles.methods}>
          <TouchableOpacity style={[styles.methodBtn, selectedMethod === 'card' && styles.methodActive]} onPress={() => setSelectedMethod('card')}>
            <Ionicons name="card-outline" size={20} color={selectedMethod === 'card' ? colors.bg.primary : colors.text.primary} />
            <Text style={[styles.methodText, selectedMethod === 'card' && styles.methodTextActive]}>{t('card')}</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' && (
            <TouchableOpacity style={[styles.methodBtn, selectedMethod === 'google_pay' && styles.methodActive]} onPress={() => setSelectedMethod('google_pay')}>
              <Ionicons name="logo-google" size={20} color={selectedMethod === 'google_pay' ? colors.bg.primary : colors.text.primary} />
              <Text style={[styles.methodText, selectedMethod === 'google_pay' && styles.methodTextActive]}>{t('googlePay')}</Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={[styles.methodBtn, selectedMethod === 'apple_pay' && styles.methodActive]} onPress={() => setSelectedMethod('apple_pay')}>
              <Ionicons name="logo-apple" size={20} color={selectedMethod === 'apple_pay' ? colors.bg.primary : colors.text.primary} />
              <Text style={[styles.methodText, selectedMethod === 'apple_pay' && styles.methodTextActive]}>{t('applePay')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity style={[styles.payButton, isProcessing && styles.buttonDisabled]} onPress={handlePay} disabled={isProcessing} activeOpacity={0.8}>
          {isProcessing ? <ActivityIndicator color={colors.bg.primary} /> : <Text style={styles.payText}>{t('pay', { amount: formatCurrency(amount) })}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.base },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  eventCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, marginBottom: spacing.xl },
  eventTitle: { ...typography.h3, color: colors.text.primary },
  eventMeta: { color: colors.text.secondary, fontSize: 14, marginTop: spacing.xs },
  costCard: { backgroundColor: colors.bg.surface, borderRadius: borderRadius.card, padding: spacing.base, marginBottom: spacing.xl },
  costTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  costLabel: { color: colors.text.secondary, fontSize: 15 },
  costValue: { color: colors.text.primary, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: spacing.md },
  totalLabel: { color: colors.text.primary, fontSize: 17, fontWeight: '700' },
  totalValue: { color: colors.accent.lime, fontSize: 17, fontWeight: '700' },
  methodTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  methods: { gap: spacing.sm },
  methodBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg.surface, borderRadius: 12, padding: spacing.base, borderWidth: 1, borderColor: colors.border.default },
  methodActive: { backgroundColor: colors.accent.lime, borderColor: colors.accent.lime },
  methodText: { color: colors.text.primary, fontSize: 16, fontWeight: '500' },
  methodTextActive: { color: colors.bg.primary },
  actionBar: { padding: spacing.xl, paddingBottom: spacing['3xl'], borderTopWidth: 1, borderTopColor: colors.border.subtle },
  payButton: { backgroundColor: colors.accent.lime, borderRadius: 9999, paddingVertical: spacing.base, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  payText: { ...typography.button, color: colors.bg.primary },
});

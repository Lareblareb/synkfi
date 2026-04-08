import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import { paymentsService } from '../services/payments';
import { participantsService } from '../services/participants';
import { PaymentMethod } from '../types/database.types';
import { PaymentResult } from '../types/payment.types';

export const usePayment = () => {
  const { initPaymentSheet, presentPaymentSheet, isApplePaySupported } =
    useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payWithCard = useCallback(
    async (
      eventId: string,
      userId: string,
      amount: number
    ): Promise<PaymentResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        const { clientSecret, paymentIntentId } =
          await paymentsService.createPaymentIntent(eventId, userId, amount);

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Synk',
          style: 'alwaysDark',
          defaultBillingDetails: { address: { country: 'FI' } },
        });

        if (initError) {
          throw new Error(initError.message);
        }

        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            setIsProcessing(false);
            return { success: false, error: 'Payment cancelled' };
          }
          throw new Error(presentError.message);
        }

        await participantsService.updatePaymentStatus(
          eventId,
          userId,
          'paid',
          'card',
          paymentIntentId
        );

        setIsProcessing(false);
        return { success: true, paymentIntentId };
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        setIsProcessing(false);
        return { success: false, error: message };
      }
    },
    []
  );

  const payWithGooglePay = useCallback(
    async (
      eventId: string,
      userId: string,
      amount: number
    ): Promise<PaymentResult> => {
      if (Platform.OS !== 'android') {
        return { success: false, error: 'Google Pay not available' };
      }

      setIsProcessing(true);
      setError(null);

      try {
        const { clientSecret, paymentIntentId } =
          await paymentsService.createPaymentIntent(eventId, userId, amount);

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Synk',
          googlePay: {
            merchantCountryCode: 'FI',
            currencyCode: 'EUR',
            testEnv: __DEV__,
          },
        });

        if (initError) throw new Error(initError.message);

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) throw new Error(presentError.message);

        await participantsService.updatePaymentStatus(
          eventId,
          userId,
          'paid',
          'google_pay' as PaymentMethod,
          paymentIntentId
        );

        setIsProcessing(false);
        return { success: true, paymentIntentId };
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        setIsProcessing(false);
        return { success: false, error: message };
      }
    },
    []
  );

  const payWithApplePay = useCallback(
    async (
      eventId: string,
      userId: string,
      amount: number
    ): Promise<PaymentResult> => {
      if (Platform.OS !== 'ios' || !isApplePaySupported) {
        return { success: false, error: 'Apple Pay not available' };
      }

      setIsProcessing(true);
      setError(null);

      try {
        const { clientSecret, paymentIntentId } =
          await paymentsService.createPaymentIntent(eventId, userId, amount);

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Synk',
          applePay: {
            merchantCountryCode: 'FI',
          },
        });

        if (initError) throw new Error(initError.message);

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) throw new Error(presentError.message);

        await participantsService.updatePaymentStatus(
          eventId,
          userId,
          'paid',
          'apple_pay' as PaymentMethod,
          paymentIntentId
        );

        setIsProcessing(false);
        return { success: true, paymentIntentId };
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        setIsProcessing(false);
        return { success: false, error: message };
      }
    },
    [isApplePaySupported]
  );

  return {
    payWithCard,
    payWithGooglePay,
    payWithApplePay,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

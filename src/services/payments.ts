import { supabase } from './supabase';
import { PaymentIntentResponse } from '../types/payment.types';

export const paymentsService = {
  async createPaymentIntent(
    eventId: string,
    userId: string,
    amount: number
  ): Promise<PaymentIntentResponse> {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        event_id: eventId,
        user_id: userId,
        amount: Math.round(amount * 100),
        currency: 'eur',
      },
    });

    if (error) throw error;
    return data as PaymentIntentResponse;
  },

  async getPaymentStatus(eventId: string, userId: string) {
    const { data, error } = await supabase
      .from('event_participants')
      .select('payment_status, payment_method, stripe_payment_intent_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },
};

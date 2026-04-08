import { PaymentMethod } from './database.types';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmation {
  event_id: string;
  event_title: string;
  amount: number;
  cost_per_person: number;
  total_participants: number;
  payment_method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'charge.refunded';
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: {
        event_id: string;
        user_id: string;
      };
    };
  };
}

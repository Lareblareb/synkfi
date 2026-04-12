import { supabase } from './supabase';
import { PaymentMethod, PaymentStatus } from '../types/database.types';

export const participantsService = {
  async joinEvent(eventId: string, userId: string, paymentStatus: PaymentStatus = 'pending') {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('current_participants, max_participants')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) throw new Error('Event not found');
    if (event.current_participants >= event.max_participants) {
      throw new Error('Event is full');
    }

    const { error } = await supabase.from('event_participants').insert({
      event_id: eventId,
      user_id: userId,
      payment_status: paymentStatus,
    });
    if (error) throw error;

    const { error: updateError } = await supabase
      .from('events')
      .update({ current_participants: event.current_participants + 1 })
      .eq('id', eventId);
    if (updateError) throw updateError;
  },

  async leaveEvent(eventId: string, userId: string) {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw error;

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('current_participants')
      .eq('id', eventId)
      .single();

    if (!eventError && event) {
      await supabase
        .from('events')
        .update({ current_participants: Math.max(0, event.current_participants - 1) })
        .eq('id', eventId);
    }
  },

  async updatePaymentStatus(
    eventId: string,
    userId: string,
    status: PaymentStatus,
    method: PaymentMethod,
    paymentIntentId: string
  ) {
    const { error } = await supabase
      .from('event_participants')
      .update({
        payment_status: status,
        payment_method: method,
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async getParticipants(eventId: string) {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      user_id: p.user_id as string,
      name: (p.user as Record<string, unknown>)?.name as string ?? '',
      avatar_url: (p.user as Record<string, unknown>)?.avatar_url as string | null ?? null,
      payment_status: p.payment_status as PaymentStatus,
      joined_at: p.joined_at as string,
    }));
  },

  async isUserParticipant(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },
};

import { supabase } from './supabase';
import { MessageInsert } from '../types/database.types';
import { ChatMessage, Conversation } from '../types/chat.types';

export const chatService = {
  async getGroupMessages(eventId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url)
      `)
      .eq('event_id', eventId)
      .eq('is_direct', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ChatMessage[];
  },

  async getDirectMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url)
      `)
      .eq('is_direct', true)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ChatMessage[];
  },

  async sendMessage(message: MessageInsert): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data as unknown as ChatMessage;
  },

  async markAsRead(messageIds: string[], userId: string): Promise<void> {
    for (const id of messageIds) {
      const { data: msg } = await supabase
        .from('messages')
        .select('read_by')
        .eq('id', id)
        .single();

      if (msg) {
        const readBy = msg.read_by ?? [];
        if (!readBy.includes(userId)) {
          await supabase
            .from('messages')
            .update({ read_by: [...readBy, userId] })
            .eq('id', id);
        }
      }
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data: groupChats, error: gError } = await supabase
      .from('event_participants')
      .select(`
        event_id,
        event:events(id, title, current_participants)
      `)
      .eq('user_id', userId);

    if (gError) throw gError;

    const conversations: Conversation[] = [];

    for (const gc of groupChats ?? []) {
      const event = gc.event as unknown as { id: string; title: string; current_participants: number };
      if (!event) continue;

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('message, created_at, read_by')
        .eq('event_id', event.id)
        .eq('is_direct', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('is_direct', false)
        .not('read_by', 'cs', `{${userId}}`);

      conversations.push({
        id: `group-${event.id}`,
        event_id: event.id,
        event_title: event.title,
        other_user: null,
        last_message: lastMsg?.message ?? '',
        last_message_at: lastMsg?.created_at ?? '',
        unread_count: count ?? 0,
        is_direct: false,
        participant_count: event.current_participants,
      });
    }

    const { data: directMsgs, error: dError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, name, avatar_url)
      `)
      .eq('is_direct', true)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (dError) throw dError;

    const dmMap = new Map<string, Conversation>();
    for (const msg of directMsgs ?? []) {
      const otherUser =
        (msg as Record<string, unknown>).sender_id === userId
          ? (msg as Record<string, unknown>).receiver
          : (msg as Record<string, unknown>).sender;

      const other = otherUser as { id: string; name: string; avatar_url: string | null };
      if (!other) continue;

      const key = other.id;
      if (!dmMap.has(key)) {
        const readBy = ((msg as Record<string, unknown>).read_by as string[]) ?? [];
        dmMap.set(key, {
          id: `dm-${other.id}`,
          event_id: null,
          event_title: null,
          other_user: other,
          last_message: (msg as Record<string, unknown>).message as string,
          last_message_at: (msg as Record<string, unknown>).created_at as string,
          unread_count: readBy.includes(userId) ? 0 : 1,
          is_direct: true,
          participant_count: 2,
        });
      }
    }

    conversations.push(...dmMap.values());
    conversations.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return conversations;
  },

  subscribeToGroupMessages(
    eventId: string,
    callback: (message: Record<string, unknown>) => void
  ) {
    return supabase
      .channel(`group-chat-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  subscribeToDirectMessages(
    userId: string,
    callback: (message: Record<string, unknown>) => void
  ) {
    return supabase
      .channel(`dm-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },
};

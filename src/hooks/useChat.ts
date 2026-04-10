import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chat';
import { useAuthStore } from '../store/auth';
import { chatService } from '../services/chat';
import { supabase } from '../services/supabase';
import { ChatMessage } from '../types/chat.types';

export const useChat = () => {
  const store = useChatStore();
  const user = useAuthStore((s) => s.user);

  const refresh = useCallback(async () => {
    if (!user) return;
    await store.fetchConversations(user.id);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, []);

  return { ...store, refresh };
};

export const useGroupChat = (eventId: string) => {
  const store = useChatStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!eventId) return;
    store.fetchGroupMessages(eventId);

    const channel = chatService.subscribeToGroupMessages(eventId, async (payload) => {
      const senderId = (payload as Record<string, unknown>).sender_id as string;
      if (senderId !== user?.id) {
        const { data } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .eq('id', senderId)
          .single();

        if (data) {
          store.addMessage({
            ...payload,
            sender: data,
          } as unknown as ChatMessage);
        }
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user || !eventId) return;
      await store.sendGroupMessage(eventId, user.id, message);
    },
    [user?.id, eventId]
  );

  return {
    messages: store.currentMessages,
    isLoading: store.isLoading,
    sendMessage,
  };
};

export const useDirectChat = (otherUserId: string) => {
  const store = useChatStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user || !otherUserId) return;
    store.fetchDirectMessages(user.id, otherUserId);

    const channel = chatService.subscribeToDirectMessages(user.id, async (payload) => {
      const senderId = (payload as Record<string, unknown>).sender_id as string;
      if (senderId === otherUserId) {
        const { data } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (data) {
          store.addMessage({
            ...payload,
            sender: data,
          } as unknown as ChatMessage);
        }
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, otherUserId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user) return;
      await store.sendDirectMessage(user.id, otherUserId, message);
    },
    [user?.id, otherUserId]
  );

  return {
    messages: store.currentMessages,
    isLoading: store.isLoading,
    sendMessage,
  };
};

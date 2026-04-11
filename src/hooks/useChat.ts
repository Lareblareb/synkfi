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
    try {
      await store.fetchConversations(user.id);
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...store, refresh };
};

export const useGroupChat = (eventId: string) => {
  const store = useChatStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!eventId) return;
    store.fetchGroupMessages(eventId).catch((err) => {
      console.warn('Failed to fetch group messages:', err);
    });

    let channel: { unsubscribe: () => void } | null = null;
    try {
      channel = chatService.subscribeToGroupMessages(eventId, async (payload) => {
        try {
          const senderId = (payload as Record<string, unknown>).sender_id as string;
          if (!senderId || senderId === user?.id) return;

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
        } catch (err) {
          console.warn('Failed to handle new message:', err);
        }
      });
    } catch (err) {
      console.warn('Failed to subscribe to group chat:', err);
    }

    return () => {
      try {
        channel?.unsubscribe();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user || !eventId) return;
      try {
        await store.sendGroupMessage(eventId, user.id, message);
      } catch (err) {
        console.warn('Failed to send message:', err);
      }
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
    store.fetchDirectMessages(user.id, otherUserId).catch((err) => {
      console.warn('Failed to fetch direct messages:', err);
    });

    let channel: { unsubscribe: () => void } | null = null;
    try {
      channel = chatService.subscribeToDirectMessages(user.id, async (payload) => {
        try {
          const senderId = (payload as Record<string, unknown>).sender_id as string;
          if (senderId !== otherUserId) return;

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
        } catch (err) {
          console.warn('Failed to handle direct message:', err);
        }
      });
    } catch (err) {
      console.warn('Failed to subscribe to direct messages:', err);
    }

    return () => {
      try {
        channel?.unsubscribe();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, otherUserId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user) return;
      try {
        await store.sendDirectMessage(user.id, otherUserId, message);
      } catch (err) {
        console.warn('Failed to send message:', err);
      }
    },
    [user?.id, otherUserId]
  );

  return {
    messages: store.currentMessages,
    isLoading: store.isLoading,
    sendMessage,
  };
};

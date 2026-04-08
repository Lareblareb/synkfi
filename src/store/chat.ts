import { create } from 'zustand';
import { ChatMessage, Conversation } from '../types/chat.types';
import { chatService } from '../services/chat';

interface ChatState {
  conversations: Conversation[];
  currentMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  totalUnread: number;
  fetchConversations: (userId: string) => Promise<void>;
  fetchGroupMessages: (eventId: string) => Promise<void>;
  fetchDirectMessages: (userId: string, otherUserId: string) => Promise<void>;
  sendGroupMessage: (eventId: string, senderId: string, message: string) => Promise<void>;
  sendDirectMessage: (senderId: string, receiverId: string, message: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  markAsRead: (messageIds: string[], userId: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentMessages: [],
  isLoading: false,
  error: null,
  totalUnread: 0,

  fetchConversations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await chatService.getConversations(userId);
      const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
      set({ conversations, totalUnread, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchGroupMessages: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await chatService.getGroupMessages(eventId);
      set({ currentMessages: messages, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchDirectMessages: async (userId, otherUserId) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await chatService.getDirectMessages(userId, otherUserId);
      set({ currentMessages: messages, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  sendGroupMessage: async (eventId, senderId, message) => {
    try {
      await chatService.sendMessage({
        event_id: eventId,
        sender_id: senderId,
        message,
        is_direct: false,
        read_by: [senderId],
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  sendDirectMessage: async (senderId, receiverId, message) => {
    try {
      await chatService.sendMessage({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        is_direct: true,
        read_by: [senderId],
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    })),

  markAsRead: async (messageIds, userId) => {
    try {
      await chatService.markAsRead(messageIds, userId);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));

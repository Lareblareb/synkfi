import { create } from 'zustand';
import { ConnectionWithUser, ConnectFilter } from '../types/connection.types';
import { PublicProfile } from '../types/user.types';
import { connectionsService } from '../services/connections';

interface ConnectionsState {
  connections: ConnectionWithUser[];
  pendingRequests: ConnectionWithUser[];
  members: PublicProfile[];
  currentProfile: PublicProfile | null;
  filter: ConnectFilter['type'];
  isLoading: boolean;
  error: string | null;
  setFilter: (filter: ConnectFilter['type']) => void;
  fetchConnections: (userId: string) => Promise<void>;
  fetchPendingRequests: (userId: string) => Promise<void>;
  fetchMembers: (filter: ConnectFilter['type']) => Promise<void>;
  fetchPublicProfile: (userId: string, currentUserId: string) => Promise<void>;
  sendConnectionRequest: (requesterId: string, addresseeId: string) => Promise<void>;
  respondToConnection: (connectionId: string, status: 'accepted' | 'declined') => Promise<void>;
  clearError: () => void;
}

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  connections: [],
  pendingRequests: [],
  members: [],
  currentProfile: null,
  filter: null,
  isLoading: false,
  error: null,

  setFilter: (filter) => set({ filter }),

  fetchConnections: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const connections = await connectionsService.getConnections(userId);
      set({ connections, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchPendingRequests: async (userId) => {
    try {
      const pendingRequests = await connectionsService.getPendingRequests(userId);
      set({ pendingRequests });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchMembers: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const members = await connectionsService.getMembers(filter);
      set({ members, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  fetchPublicProfile: async (userId, currentUserId) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await connectionsService.getPublicProfile(userId, currentUserId);
      set({ currentProfile: profile, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  sendConnectionRequest: async (requesterId, addresseeId) => {
    try {
      await connectionsService.sendConnectionRequest(requesterId, addresseeId);
      set((state) => ({
        members: state.members.map((m) =>
          m.id === addresseeId
            ? { ...m, connection_status: 'pending_sent' as const }
            : m
        ),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  respondToConnection: async (connectionId, status) => {
    try {
      await connectionsService.respondToConnection(connectionId, status);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== connectionId),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));

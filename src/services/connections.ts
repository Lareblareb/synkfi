import { supabase } from './supabase';
import { ConnectionStatus } from '../types/database.types';
import { ConnectionWithUser, ConnectFilter } from '../types/connection.types';
import { PublicProfile } from '../types/user.types';

export const connectionsService = {
  async sendConnectionRequest(requesterId: string, addresseeId: string): Promise<void> {
    const { error } = await supabase.from('connections').insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    });
    if (error) throw error;
  },

  async respondToConnection(
    connectionId: string,
    status: ConnectionStatus
  ): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', connectionId);
    if (error) throw error;
  },

  async getConnections(userId: string): Promise<ConnectionWithUser[]> {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:users!connections_requester_id_fkey(id, name, avatar_url, bio, sports, skill_level, location_name),
        addressee:users!connections_addressee_id_fkey(id, name, avatar_url, bio, sports, skill_level, location_name)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) throw error;

    return (data ?? []).map((conn: Record<string, unknown>) => ({
      ...conn,
      user:
        conn.requester_id === userId
          ? conn.addressee
          : conn.requester,
    })) as unknown as ConnectionWithUser[];
  },

  async getPendingRequests(userId: string): Promise<ConnectionWithUser[]> {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:users!connections_requester_id_fkey(id, name, avatar_url, bio, sports, skill_level, location_name)
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return (data ?? []).map((conn: Record<string, unknown>) => ({
      ...conn,
      user: conn.requester,
    })) as unknown as ConnectionWithUser[];
  },

  async getConnectionStatus(
    userId: string,
    otherUserId: string
  ): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted'> {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${userId})`
      )
      .maybeSingle();

    if (!data) return 'none';
    if (data.status === 'accepted') return 'accepted';
    if (data.requester_id === userId) return 'pending_sent';
    return 'pending_received';
  },

  async getMembers(filter: ConnectFilter['type']): Promise<PublicProfile[]> {
    let query = supabase
      .from('users')
      .select('id, name, avatar_url, bio, location_name, sports, skill_level')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'student') {
      query = query.not('sports', 'eq', '{}');
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((user: Record<string, unknown>) => ({
      ...user,
      events_created_count: 0,
      events_joined_count: 0,
      connections_count: 0,
      is_connected: false,
      connection_status: 'none' as const,
    })) as unknown as PublicProfile[];
  },

  async getPublicProfile(userId: string, currentUserId: string): Promise<PublicProfile> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, bio, location_name, sports, skill_level')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { count: eventsCreated } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId);

    const { count: eventsJoined } = await supabase
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    const connectionStatus = await this.getConnectionStatus(currentUserId, userId);

    return {
      ...user,
      events_created_count: eventsCreated ?? 0,
      events_joined_count: eventsJoined ?? 0,
      connections_count: connectionsCount ?? 0,
      is_connected: connectionStatus === 'accepted',
      connection_status: connectionStatus,
    } as PublicProfile;
  },
};

import { supabase } from './supabase';
import {
  EventInsert,
  EventUpdate,
  EventRow,
} from '../types/database.types';
import { EventFilters, EventWithCreator } from '../types/event.types';
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, nextSaturday, nextSunday } from 'date-fns';

const HELSINKI_LAT = 60.1699;
const HELSINKI_LNG = 24.9384;

export const eventsService = {
  async getEvents(
    filters: EventFilters,
    userLat: number = HELSINKI_LAT,
    userLng: number = HELSINKI_LNG,
    userId: string
  ): Promise<EventWithCreator[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(id, name, avatar_url),
        participants:event_participants(
          id,
          user_id,
          payment_status,
          joined_at,
          user:users(id, name, avatar_url)
        )
      `)
      .eq('status', 'active')
      .gte('date_time', new Date().toISOString());

    if (filters.sports.length > 0) {
      query = query.in('sport', filters.sports);
    }

    if (filters.skillLevel !== 'any') {
      query = query.eq('skill_level', filters.skillLevel);
    }

    if (filters.gender !== 'any') {
      query = query.eq('gender_preference', filters.gender);
    }

    if (filters.dateRange) {
      const now = new Date();
      let dateStart: Date;
      let dateEnd: Date;

      switch (filters.dateRange) {
        case 'today':
          dateStart = startOfDay(now);
          dateEnd = endOfDay(now);
          break;
        case 'tomorrow':
          dateStart = startOfDay(addDays(now, 1));
          dateEnd = endOfDay(addDays(now, 1));
          break;
        case 'this_week':
          dateStart = startOfDay(now);
          dateEnd = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'this_weekend':
          dateStart = startOfDay(nextSaturday(now));
          dateEnd = endOfDay(nextSunday(now));
          break;
        case 'custom':
          if (filters.customDate) {
            dateStart = startOfDay(new Date(filters.customDate));
            dateEnd = endOfDay(new Date(filters.customDate));
          } else {
            dateStart = now;
            dateEnd = addDays(now, 30);
          }
          break;
        default:
          dateStart = now;
          dateEnd = addDays(now, 30);
      }

      query = query
        .gte('date_time', dateStart.toISOString())
        .lte('date_time', dateEnd.toISOString());
    }

    query = query.order('date_time', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    const events = (data ?? []).map((event: Record<string, unknown>) => {
      const participants = ((event.participants as Array<Record<string, unknown>>) ?? []).map(
        (p: Record<string, unknown>) => ({
          id: p.id as string,
          user_id: p.user_id as string,
          name: (p.user as Record<string, unknown>)?.name as string ?? '',
          avatar_url: (p.user as Record<string, unknown>)?.avatar_url as string | null ?? null,
          payment_status: p.payment_status as string,
          joined_at: p.joined_at as string,
        })
      );

      return {
        ...event,
        creator: event.creator as EventWithCreator['creator'],
        participants,
        is_joined: participants.some(
          (p: { user_id: string }) => p.user_id === userId
        ),
        is_creator: (event as EventRow).created_by === userId,
      } as EventWithCreator;
    });

    return events;
  },

  async getEventById(eventId: string, userId: string): Promise<EventWithCreator> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(id, name, avatar_url),
        participants:event_participants(
          id,
          user_id,
          payment_status,
          joined_at,
          user:users(id, name, avatar_url)
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;

    const participants = ((data.participants as Array<Record<string, unknown>>) ?? []).map(
      (p: Record<string, unknown>) => ({
        id: p.id as string,
        user_id: p.user_id as string,
        name: (p.user as Record<string, unknown>)?.name as string ?? '',
        avatar_url: (p.user as Record<string, unknown>)?.avatar_url as string | null ?? null,
        payment_status: p.payment_status as string,
        joined_at: p.joined_at as string,
      })
    );

    return {
      ...data,
      creator: data.creator as EventWithCreator['creator'],
      participants,
      is_joined: participants.some(
        (p: { user_id: string }) => p.user_id === userId
      ),
      is_creator: data.created_by === userId,
    } as EventWithCreator;
  },

  async createEvent(event: EventInsert): Promise<EventRow> {
    // Remove location field to avoid PostGIS formatting issues
    // The database has a default Helsinki location
    const eventPayload: Record<string, unknown> = { ...event };
    delete eventPayload.location;

    const { data, error } = await supabase
      .from('events')
      .insert(eventPayload)
      .select()
      .single();

    if (error) {
      console.error('Create event error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Event was not created');
    }

    // Add creator as participant (fire and forget)
    try {
      await supabase.from('event_participants').insert({
        event_id: data.id,
        user_id: event.created_by,
        payment_status: 'paid',
      });
    } catch (participantErr) {
      console.warn('Failed to add creator as participant:', participantErr);
    }

    return data;
  },

  async updateEvent(eventId: string, update: EventUpdate): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', eventId);
    if (error) throw error;
  },

  async cancelEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', eventId);
    if (error) throw error;
  },

  async getMyJoinedEvents(userId: string): Promise<EventWithCreator[]> {
    const { data: participantData, error: pError } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', userId);

    if (pError) throw pError;

    const eventIds = (participantData ?? []).map((p) => p.event_id);
    if (eventIds.length === 0) return [];

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(id, name, avatar_url),
        participants:event_participants(
          id,
          user_id,
          payment_status,
          joined_at,
          user:users(id, name, avatar_url)
        )
      `)
      .in('id', eventIds)
      .order('date_time', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((event: Record<string, unknown>) => {
      const participants = ((event.participants as Array<Record<string, unknown>>) ?? []).map(
        (p: Record<string, unknown>) => ({
          id: p.id as string,
          user_id: p.user_id as string,
          name: (p.user as Record<string, unknown>)?.name as string ?? '',
          avatar_url: (p.user as Record<string, unknown>)?.avatar_url as string | null ?? null,
          payment_status: p.payment_status as string,
          joined_at: p.joined_at as string,
        })
      );

      return {
        ...event,
        creator: event.creator as EventWithCreator['creator'],
        participants,
        is_joined: true,
        is_creator: (event as EventRow).created_by === userId,
      } as EventWithCreator;
    });
  },

  async getMyCreatedEvents(userId: string): Promise<EventWithCreator[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(id, name, avatar_url),
        participants:event_participants(
          id,
          user_id,
          payment_status,
          joined_at,
          user:users(id, name, avatar_url)
        )
      `)
      .eq('created_by', userId)
      .order('date_time', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((event: Record<string, unknown>) => {
      const participants = ((event.participants as Array<Record<string, unknown>>) ?? []).map(
        (p: Record<string, unknown>) => ({
          id: p.id as string,
          user_id: p.user_id as string,
          name: (p.user as Record<string, unknown>)?.name as string ?? '',
          avatar_url: (p.user as Record<string, unknown>)?.avatar_url as string | null ?? null,
          payment_status: p.payment_status as string,
          joined_at: p.joined_at as string,
        })
      );

      return {
        ...event,
        creator: event.creator as EventWithCreator['creator'],
        participants,
        is_joined: true,
        is_creator: true,
      } as EventWithCreator;
    });
  },

  subscribeToEvent(eventId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`,
        },
        callback
      )
      .subscribe();
  },
};

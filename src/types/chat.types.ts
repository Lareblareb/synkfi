import { MessageRow } from './database.types';

export interface ChatMessage extends MessageRow {
  sender: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  event_id: string | null;
  event_title: string | null;
  other_user: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_direct: boolean;
  participant_count: number;
}

export interface ChatGroup {
  messages: ChatMessage[];
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  is_own: boolean;
}

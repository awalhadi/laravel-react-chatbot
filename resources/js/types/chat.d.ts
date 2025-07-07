export interface Conversation {
    id: number;
    reference_id: string;
    guest_session_id: number;
    assigned_user_id?: number;
    status: 'active' | 'waiting' | 'closed' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    subject?: string;
    tags?: string[];
    first_message_at: string;
    last_message_at?: string;
    closed_at?: string;
    assigned_at?: string;
    message_count: number;
    response_time_seconds?: number;
    created_at: string;
    updated_at: string;
    guest_session?: GuestSession;
    assigned_user?: User;
    unread_count?: number;
    last_message?: Message;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_type: 'guest' | 'user' | 'bot';
    sender_id?: number;
    sender_name?: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'system';
    attachments?: Record<string, unknown>[];
    is_bot_message: boolean;
    confidence_score?: number;
    intent?: string;
    requires_human_review?: boolean;
    delivered_at?: string;
    read_at?: string;
    is_internal_note: boolean;
    is_edited: boolean;
    edited_at?: string;
    created_at: string;
    updated_at: string;
}

export interface GuestSession {
    id: number;
    session_id: string;
    ip_address?: string;
    user_agent?: string;
    browser_info?: Record<string, unknown>;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface ChatUser extends User {
    role: 'admin' | 'agent' | 'super_admin';
    status: 'active' | 'inactive' | 'busy';
    is_online: boolean;
    last_seen_at?: string;
    avatar?: string;
    phone?: string;
}

export interface ChatNotification {
    id: string;
    type: 'new_message' | 'conversation_assigned' | 'conversation_closed' | 'system';
    title: string;
    message: string;
    conversation_id?: number;
    message_id?: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    read: boolean;
    created_at: string;
}

export interface ChatStats {
    total_conversations: number;
    active_conversations: number;
    waiting_conversations: number;
    closed_conversations: number;
    average_response_time: number;
    total_messages: number;
    unread_messages: number;
}

export interface RealTimeEvent {
    event: 'message.sent' | 'conversation.status.changed' | 'conversation.assigned' | 'user.online' | 'user.offline';
    data: Record<string, unknown>;
    timestamp: string;
}

export interface ChatFilters {
    status?: string[];
    priority?: string[];
    assigned_to?: number[];
    date_range?: {
        start: string;
        end: string;
    };
    tags?: string[];
    search?: string;
}

export interface ChatSettings {
    auto_assign: boolean;
    notification_sound: boolean;
    desktop_notifications: boolean;
    message_preview: boolean;
    typing_indicators: boolean;
    read_receipts: boolean;
}

export interface TypingIndicator {
    user_id: number;
    user_name: string;
    conversation_id: number;
    is_typing: boolean;
    started_at: string;
}

export interface ChatState {
    conversations: Conversation[];
    activeConversation?: Conversation;
    messages: Message[];
    users: ChatUser[];
    notifications: ChatNotification[];
    stats: ChatStats;
    filters: ChatFilters;
    settings: ChatSettings;
    typingUsers: TypingIndicator[];
    isLoading: boolean;
    error?: string;
}

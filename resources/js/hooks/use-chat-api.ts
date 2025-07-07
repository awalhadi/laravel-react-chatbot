import { useState, useCallback } from 'react';
import { type Conversation, type Message, type ChatStats, type ChatUser } from '@/types/chat';

export function useChatApi() {
    const [loading, setLoading] = useState(false);

        const apiCall = useCallback(async <T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> => {
        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(url, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Stats
    const getStats = useCallback(async (): Promise<ChatStats> => {
        return apiCall<ChatStats>('/api/admin/chat/stats');
    }, [apiCall]);

    // Conversations
    const getConversations = useCallback(async (filters?: Record<string, string>): Promise<any> => {
        const params = new URLSearchParams(filters);
        return apiCall<any>(`/api/admin/chat/conversations?${params}`);
    }, [apiCall]);

    const getActiveConversations = useCallback(async (): Promise<Conversation[]> => {
        const response = await apiCall<{ conversations: Conversation[] }>('/api/admin/chat/conversations/active');
        return response.conversations;
    }, [apiCall]);

    const getWaitingConversations = useCallback(async (): Promise<Conversation[]> => {
        const response = await apiCall<{ conversations: Conversation[] }>('/api/admin/chat/conversations/waiting');
        return response.conversations;
    }, [apiCall]);

    const getConversationDetails = useCallback(async (conversationId: number): Promise<Conversation> => {
        return apiCall<Conversation>(`/api/admin/chat/conversations/${conversationId}`);
    }, [apiCall]);

    const assignConversation = useCallback(async (conversationId: number, userId?: number): Promise<Conversation> => {
        const response = await apiCall<{ conversation: Conversation }>(`/api/admin/chat/conversations/${conversationId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        });
        return response.conversation;
    }, [apiCall]);

    const closeConversation = useCallback(async (conversationId: number): Promise<void> => {
        await apiCall(`/api/admin/chat/conversations/${conversationId}/close`, {
            method: 'POST',
        });
    }, [apiCall]);

    const updateConversationStatus = useCallback(async (
        conversationId: number,
        status: string,
        priority?: string,
        tags?: string[]
    ): Promise<Conversation> => {
        const response = await apiCall<{ conversation: Conversation }>(`/api/admin/chat/conversations/${conversationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, priority, tags }),
        });
        return response.conversation;
    }, [apiCall]);

    // Messages
    const getMessages = useCallback(async (conversationId: number, page = 1): Promise<any> => {
        return apiCall<any>(`/api/admin/chat/conversations/${conversationId}/messages?page=${page}`);
    }, [apiCall]);

    const sendMessage = useCallback(async (
        conversationId: number,
        message: string,
        isInternalNote = false
    ): Promise<Message> => {
        const response = await apiCall<{ message: Message }>(`/api/admin/chat/conversations/${conversationId}/send`, {
            method: 'POST',
            body: JSON.stringify({ message, is_internal_note: isInternalNote }),
        });
        return response.message;
    }, [apiCall]);

    const markMessageAsRead = useCallback(async (messageId: number): Promise<void> => {
        await apiCall(`/api/admin/chat/messages/${messageId}/read`, {
            method: 'PUT',
        });
    }, [apiCall]);

    // Users
    const getUsers = useCallback(async (): Promise<ChatUser[]> => {
        return apiCall<ChatUser[]>('/api/admin/chat/users');
    }, [apiCall]);

    const getOnlineUsers = useCallback(async (): Promise<ChatUser[]> => {
        return apiCall<ChatUser[]>('/api/admin/chat/users/online');
    }, [apiCall]);

    // Notifications
    const getNotifications = useCallback(async (): Promise<any[]> => {
        return apiCall<any[]>('/api/admin/chat/notifications');
    }, [apiCall]);

    const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
        await apiCall(`/api/admin/chat/notifications/${notificationId}/read`, {
            method: 'PUT',
        });
    }, [apiCall]);

    return {
        loading,
        getStats,
        getConversations,
        getActiveConversations,
        getWaitingConversations,
        getConversationDetails,
        assignConversation,
        closeConversation,
        updateConversationStatus,
        getMessages,
        sendMessage,
        markMessageAsRead,
        getUsers,
        getOnlineUsers,
        getNotifications,
        markNotificationAsRead,
    };
}

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
            // Get the Bearer token from localStorage (or your store)
            const token = localStorage.getItem('api_token');
            let headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers as Record<string, string>,
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                headers,
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
        return apiCall<ChatStats>('/api/chat/stats');
    }, [apiCall]);

    // Conversations
    const getConversations = useCallback(async (filters?: Record<string, string>): Promise<any> => {
        const params = new URLSearchParams(filters);
        return apiCall<any>(`/api/chat/conversations?${params}`);
    }, [apiCall]);

    const getActiveConversations = useCallback(async (): Promise<Conversation[]> => {
        const response = await apiCall<{ conversations: Conversation[] }>('/api/conversations/active');
        return response.conversations;
    }, [apiCall]);

    const getWaitingConversations = useCallback(async (): Promise<Conversation[]> => {
        const response = await apiCall<{ conversations: Conversation[] }>('/api/conversations/waiting');
        return response.conversations;
    }, [apiCall]);

    const getConversationDetails = useCallback(async (conversationId: number): Promise<Conversation> => {
        return apiCall<Conversation>(`/api/conversations/${conversationId}`);
    }, [apiCall]);

    const assignConversation = useCallback(async (conversationId: number, userId?: number): Promise<Conversation> => {
        const response = await apiCall<{ conversation: Conversation }>(`/api/conversations/${conversationId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        });
        return response.conversation;
    }, [apiCall]);

    const closeConversation = useCallback(async (conversationId: number): Promise<void> => {
        await apiCall(`/api/conversations/${conversationId}/close`, {
            method: 'POST',
        });
    }, [apiCall]);

    const updateConversationStatus = useCallback(async (
        conversationId: number,
        status: string,
        priority?: string,
        tags?: string[]
    ): Promise<Conversation> => {
        const response = await apiCall<{ conversation: Conversation }>(`/api/conversations/${conversationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, priority, tags }),
        });
        return response.conversation;
    }, [apiCall]);

    // Messages
    const getMessages = useCallback(async (conversationId: number, page = 1): Promise<any> => {
        return apiCall<any>(`/api/conversations/${conversationId}/messages?page=${page}`);
    }, [apiCall]);

    const sendMessage = useCallback(async (
        conversationId: number,
        message: string,
        isInternalNote = false
    ): Promise<Message> => {
        const response = await apiCall<{ message: Message }>(`/api/conversations/${conversationId}/send`, {
            method: 'POST',
            body: JSON.stringify({ message, is_internal_note: isInternalNote }),
        });
        return response.message;
    }, [apiCall]);

    const markMessageAsRead = useCallback(async (messageId: number): Promise<void> => {
        await apiCall(`/api/messages/${messageId}/read`, {
            method: 'PUT',
        });
    }, [apiCall]);

    // Users
    const getUsers = useCallback(async (): Promise<ChatUser[]> => {
        return apiCall<ChatUser[]>('/api/chat/users');
    }, [apiCall]);

    const getOnlineUsers = useCallback(async (): Promise<ChatUser[]> => {
        return apiCall<ChatUser[]>('/api/chat/users/online');
    }, [apiCall]);

    // Notifications
    const getNotifications = useCallback(async (): Promise<any[]> => {
        return apiCall<any[]>('/api/chat/notifications');
    }, [apiCall]);

    const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
        await apiCall(`/api/chat/notifications/${notificationId}/read`, {
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

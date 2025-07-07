// resources/js/hooks/useConversations.ts
import { useState, useCallback } from 'react';
import { Conversation, Message } from '@/types/chat';

interface InitialData {
    activeConversations?: Conversation[];
    waitingConversations?: Conversation[];
}

interface ConversationsState {
    active: Conversation[];
    waiting: Conversation[];
    closed: Conversation[];
}

interface ApiResponse<T> {
    data: T;
}

interface ConversationResponse {
    conversation: Conversation;
}

interface ConversationsResponse {
    conversations: Conversation[];
}

export function useConversations(initialData: InitialData) {
    const [conversations, setConversations] = useState<ConversationsState>({
        active: initialData.activeConversations || [],
        waiting: initialData.waitingConversations || [],
        closed: []
    });
    const [loading, setLoading] = useState<boolean>(false);

    const updateConversation = useCallback((updatedConversation: Conversation) => {
        setConversations(prev => {
            const newState: ConversationsState = { ...prev };

            // Remove from all categories first
            (Object.keys(newState) as Array<keyof ConversationsState>).forEach(category => {
                newState[category] = newState[category].filter(
                    (conv: Conversation) => conv.id !== updatedConversation.id
                );
            });

            // Add to appropriate category
            const targetCategory: keyof ConversationsState =
                updatedConversation.status === 'active' ? 'active' :
                updatedConversation.status === 'waiting' ? 'waiting' : 'closed';

            newState[targetCategory].push(updatedConversation);

            return newState;
        });
    }, []);

    const addMessage = useCallback((conversationId: number, message: Message) => {
        setConversations(prev => {
            const newState: ConversationsState = { ...prev };

            (Object.keys(newState) as Array<keyof ConversationsState>).forEach(category => {
                newState[category] = newState[category].map((conv: Conversation) => {
                    if (conv.id === conversationId) {
                        return {
                            ...conv,
                            message_count: conv.message_count + 1,
                            last_message_at: message.created_at
                        };
                    }
                    return conv;
                });
            });

            return newState;
        });
    }, []);

    const assignConversation = useCallback(async (conversationId: number, userId: number) => {
        try {
            const response = await fetch(`/api/admin/chat/conversations/${conversationId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: userId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ConversationResponse = await response.json();
            updateConversation(data.conversation);
        } catch (error) {
            console.error('Error assigning conversation:', error);
            throw error;
        }
    }, [updateConversation]);

    const closeConversation = useCallback(async (conversationId: number) => {
        try {
            const response = await fetch(`/api/admin/chat/conversations/${conversationId}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setConversations(prev => {
                const newState: ConversationsState = { ...prev };
                let conversationToMove: Conversation | null = null;

                // Find and remove from current category
                (Object.keys(newState) as Array<keyof ConversationsState>).forEach(category => {
                    const index = newState[category].findIndex((conv: Conversation) => conv.id === conversationId);
                    if (index !== -1) {
                        conversationToMove = { ...newState[category][index], status: 'closed' };
                        newState[category].splice(index, 1);
                    }
                });

                // Add to closed category
                if (conversationToMove) {
                    newState.closed.push(conversationToMove);
                }

                return newState;
            });
        } catch (error) {
            console.error('Error closing conversation:', error);
            throw error;
        }
    }, []);

    const refreshConversations = useCallback(async () => {
        try {
            setLoading(true);
            const [activeResponse, waitingResponse] = await Promise.all([
                fetch('/api/admin/chat/conversations/active', {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    }
                }),
                fetch('/api/admin/chat/conversations/waiting', {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    }
                })
            ]);

            if (!activeResponse.ok || !waitingResponse.ok) {
                throw new Error('Failed to fetch conversations');
            }

            const [activeData, waitingData]: [ConversationsResponse, ConversationsResponse] = await Promise.all([
                activeResponse.json(),
                waitingResponse.json()
            ]);

            setConversations({
                active: activeData.conversations || [],
                waiting: waitingData.conversations || [],
                closed: []
            });
        } catch (error) {
            console.error('Error refreshing conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        conversations,
        loading,
        updateConversation,
        addMessage,
        assignConversation,
        closeConversation,
        refreshConversations
    };
}

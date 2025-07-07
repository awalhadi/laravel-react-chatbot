// resources/js/Components/Admin/Chat/ConversationView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import MessageList from './messageList';
import MessageInput from './messageInput';
import ConversationHeader from './conversationHeader';
import { useBroadcast } from '@/hooks/useBroadcast';
import { Conversation, Message, ChatUser } from '@/types/chat';
import { apiRequest } from '@/lib/api';
import { store } from '@/lib/store';
import axios from 'axios';

interface ConversationViewProps {
    conversation: Conversation | null;
    onAssign?: (conversationId: number, userId: number) => void;
    onClose?: (conversationId: number) => void;
    onMessageSent?: (conversationId: number, message: Message) => void;
    availableAgents: ChatUser[];
}

interface BroadcastData {
    message: Message;
}

export default function ConversationView({
    conversation,
    onAssign,
    onClose,
    onMessageSent,
    availableAgents
}: ConversationViewProps): React.JSX.Element | null {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sending, setSending] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversation messages
    useEffect(() => {
        if (conversation?.id) {
            loadMessages();
        }
    }, [conversation?.id]);

    // Set up real-time broadcasting for this conversation
    useBroadcast({
        channels: conversation?.id ? [`conversation.${conversation.id}`] : [],
        events: {
            'message.sent': (data: BroadcastData) => {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        }
    });

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async (): Promise<void> => {
        if (!conversation?.id) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/admin/chat/conversations/${conversation.id}`, {
                headers: {
                    'Authorization': `Bearer ${store.getApiToken()}`
                }
            });
            const data = await response.json();

            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (content: string, isInternalNote: boolean = false): Promise<void> => {
        if (!conversation?.id) return;

        try {
            setSending(true);
            // first push to messages array
            // then send message
            // update send message using formData instead of JSON.stringify
            const formData = new FormData();
            formData.append('message', content);
            formData.append('is_internal_note', isInternalNote ? '1' : '0');


            const response = await fetch(`/api/admin/chat/conversations/${conversation.id}/send`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${store.getApiToken()}`
                }
            });

            const data = await response.json();
            setMessages(prev => [...prev, data.message]);
            // Message will be added via broadcast
            onMessageSent?.(conversation.id, data.message);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAssignConversation = async (userId: number): Promise<void> => {
        if (!conversation?.id) return;

        try {
            await fetch(`/api/conversations/${conversation.id}/assign`, {
                method: 'POST',
                body: JSON.stringify({ user_id: userId }),
                headers: {
                    'Authorization': `Bearer ${store.getApiToken()}`
                }
            });
            onAssign?.(conversation.id, userId);
        } catch (error) {
            console.error('Error assigning conversation:', error);
            alert('Failed to assign conversation');
        }
    };

    const handleCloseConversation = async (): Promise<void> => {
        if (!conversation?.id) return;

        try {
            await fetch(`/api/conversations/${conversation.id}/close`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${store.getApiToken()}`
                }
            });
            onClose?.(conversation.id);
        } catch (error) {
            console.error('Error closing conversation:', error);
            alert('Failed to close conversation');
        }
    };

    if (!conversation) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <ConversationHeader
                conversation={conversation}
                availableAgents={availableAgents}
                onAssign={handleAssignConversation}
                onClose={handleCloseConversation}
            />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <MessageList messages={messages} />
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sending || conversation.status === 'closed'}
                loading={sending}
            />
        </div>
    );
}

// resources/js/Components/Admin/Chat/ConversationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import { useBroadcast } from '@/Hooks/useBroadcast';

export default function ConversationView({
    conversation,
    onAssign,
    onClose,
    onMessageSent,
    availableAgents
}) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Load conversation messages
    useEffect(() => {
        if (conversation?.id) {
            loadMessages();
        }
    }, [conversation?.id]);

    // Set up real-time broadcasting for this conversation
    useBroadcast({
        channels: [`conversation.${conversation?.id}`],
        events: {
            'message.sent': (data) => {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        }
    });

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/chat/conversations/${conversation.id}`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (content, isInternalNote = false) => {
        try {
            setSending(true);
            const response = await axios.post(`/api/admin/chat/conversations/${conversation.id}/send`, {
                message: content,
                is_internal_note: isInternalNote
            });

            // Message will be added via broadcast
            onMessageSent?.(conversation.id, response.data.message);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAssignConversation = async (userId) => {
        try {
            await axios.post(`/api/admin/chat/conversations/${conversation.id}/assign`, {
                user_id: userId
            });
            onAssign?.(conversation.id, userId);
        } catch (error) {
            console.error('Error assigning conversation:', error);
            alert('Failed to assign conversation');
        }
    };

    const handleCloseConversation = async () => {
        try {
            await axios.post(`/api/admin/chat/conversations/${conversation.id}/close`);
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

import { useEffect, useState, useRef } from 'react';
import { type Conversation, type Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatApi } from '@/hooks/use-chat-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
    conversation: Conversation;
    onConversationUpdate?: (conversation: Conversation) => void;
}

export function ChatInterface({ conversation, onConversationUpdate }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { getMessages, sendMessage, markMessageAsRead } = useChatApi();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getMessages(conversation.id);
                setMessages(response.data || response);

                // Mark unread messages as read
                const unreadMessages = messages.filter(msg =>
                    msg.sender_type === 'guest' && !msg.read_at
                );
                for (const msg of unreadMessages) {
                    await markMessageAsRead(msg.id);
                }
            } catch (err) {
                setError('Failed to load messages');
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
            }
        };

        if (conversation.id) {
            fetchMessages();
        }
    }, [conversation.id, getMessages, markMessageAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        try {
            setSending(true);
            const newMessage = await sendMessage(conversation.id, input.trim());
            setMessages(prev => [...prev, newMessage]);
            setInput('');

            // Update conversation if callback provided
            if (onConversationUpdate) {
                onConversationUpdate({
                    ...conversation,
                    message_count: conversation.message_count + 1,
                    last_message_at: new Date().toISOString(),
                });
            }
        } catch (err) {
            setError('Failed to send message');
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-start">
                            <Skeleton className="h-16 w-64 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center bg-background">
                    <div className="text-center text-muted-foreground">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <div className="text-xs font-semibold mb-1">{msg.sender_name}</div>
                            <div className="text-sm">{msg.content}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-2 flex items-center gap-2 bg-background">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                    disabled={sending}
                />
                <Button onClick={handleSend} disabled={!input.trim() || sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}

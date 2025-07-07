import { useEffect, useState } from 'react';
import { type Conversation } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { useChatApi } from '@/hooks/use-chat-api';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
    selectedConversation: Conversation | null;
    onConversationSelect: (conversation: Conversation) => void;
}

export function ConversationList({ selectedConversation, onConversationSelect }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getConversations } = useChatApi();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getConversations();
                setConversations(response.data || response);
            } catch (err) {
                setError('Failed to load conversations');
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [getConversations]);

    if (loading) {
        return (
            <div className="h-full overflow-y-auto bg-background">
                <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conversations</div>
                <div className="space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3">
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full overflow-y-auto bg-background">
                <div className="p-4 text-center text-sm text-muted-foreground">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conversations</div>
            <ul>
                {conversations.map((conv) => (
                    <li
                        key={conv.id}
                        className={`flex items-center px-4 py-3 cursor-pointer border-b hover:bg-muted/40 transition ${selectedConversation?.id === conv.id ? 'bg-muted' : ''}`}
                        onClick={() => onConversationSelect(conv)}
                    >
                        <div className="flex-1">
                            <div className="font-medium text-sm">{conv.reference_id}</div>
                            <div className="text-xs text-muted-foreground">{conv.status}</div>
                        </div>
                        {conv.unread_count && conv.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">{conv.unread_count}</Badge>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

import { createContext, useContext, useState, ReactNode } from 'react';
import { Conversation, Message, ChatState } from '@/types/chat';

interface ChatContextType {
    state: ChatState;
    setState: React.Dispatch<React.SetStateAction<ChatState>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ChatState>({
        conversations: [],
        activeConversation: undefined,
        messages: [],
        users: [],
        notifications: [],
        stats: {
            total_conversations: 0,
            active_conversations: 0,
            waiting_conversations: 0,
            closed_conversations: 0,
            average_response_time: 0,
            total_messages: 0,
            unread_messages: 0,
        },
        filters: {},
        settings: {
            auto_assign: true,
            notification_sound: true,
            desktop_notifications: true,
            message_preview: true,
            typing_indicators: true,
            read_receipts: true,
        },
        typingUsers: [],
        isLoading: false,
        error: undefined,
    });

    // TODO: Add real-time event handling (WebSocket, Echo, etc.)

    return (
        <ChatContext.Provider value={{ state, setState }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}

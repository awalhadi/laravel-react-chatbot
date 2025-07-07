import { type RealTimeEvent } from '@/types/chat';

type EventCallback = (data: Record<string, unknown>) => void;

class ChatService {
    private eventSource: EventSource | null = null;
    private listeners: Map<string, Set<EventCallback>> = new Map();

    constructor() {
        this.initializeEventSource();
    }

    private initializeEventSource() {
        // Initialize Server-Sent Events for real-time updates
        // This is a placeholder - implement with your preferred real-time solution
        // (Laravel Echo, Pusher, WebSockets, etc.)

        try {
            this.eventSource = new EventSource('/api/admin/chat/events');

            this.eventSource.onmessage = (event) => {
                const data: RealTimeEvent = JSON.parse(event.data);
                this.handleRealTimeEvent(data);
            };

            this.eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                // Reconnect after 5 seconds
                setTimeout(() => this.initializeEventSource(), 5000);
            };
        } catch (error) {
            console.error('Failed to initialize EventSource:', error);
        }
    }

    private handleRealTimeEvent(event: RealTimeEvent) {
        const listeners = this.listeners.get(event.event);
        if (listeners) {
            listeners.forEach(listener => listener(event.data));
        }
    }

    public subscribe(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    public unsubscribe(event: string, callback: EventCallback) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    public disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.listeners.clear();
    }
}

// Export singleton instance
export const chatService = new ChatService();

// React hook for using the chat service
export function useChatService() {
    return {
        subscribe: chatService.subscribe.bind(chatService),
        unsubscribe: chatService.unsubscribe.bind(chatService),
        disconnect: chatService.disconnect.bind(chatService),
    };
}

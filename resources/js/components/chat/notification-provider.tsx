import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatNotification } from '@/types/chat';
import { AlertCircle } from 'lucide-react';

interface NotificationContextType {
    notifications: ChatNotification[];
    addNotification: (notification: ChatNotification) => void;
    markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<ChatNotification[]>([]);

    const addNotification = (notification: ChatNotification) => {
        setNotifications((prev) => [notification, ...prev]);
    };
    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead }}>
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.filter((n) => !n.read).map((n) => (
                    <div key={n.id} className="flex items-center bg-destructive text-destructive-foreground px-4 py-2 rounded shadow-lg">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <div className="flex-1">
                            <div className="font-semibold text-sm">{n.title}</div>
                            <div className="text-xs">{n.message}</div>
                        </div>
                        <button className="ml-4 text-xs underline" onClick={() => markAsRead(n.id)}>Mark as read</button>
                    </div>
                ))}
            </div>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
    return ctx;
}

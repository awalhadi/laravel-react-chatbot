import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Conversation, type ChatStats } from '@/types/chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { NotificationProvider } from '@/components/chat/notification-provider';
import { ChatProvider } from '@/components/chat/chat-provider';
import { useChatApi } from '@/hooks/use-chat-api';
import { Button } from '@/components/ui/button';
import {
    MessageSquare,
    Clock,
    AlertCircle,
    Plus,
    Filter,
    Search
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Admin Chat',
        href: '/admin/chat',
    },
];

export default function AdminChat({ statistics }: { statistics: ChatStats }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [stats, setStats] = useState<ChatStats>(statistics);
    // const { getStats } = useChatApi();

    useEffect(() => {
        setStats(statistics);
        // const fetchStats = async () => {
        //     try {
        //         const statsData = await getStats();
        //         setStats(statsData);
        //     } catch (error) {
        //         console.error('Failed to fetch stats:', error);
        //     }
        // };

        // fetchStats();
        // Refresh stats every 30 seconds
        // const interval = setInterval(fetchStats, 30000);
        // return () => clearInterval(interval);
    }, [statistics]);

    return (
        <NotificationProvider>
            <ChatProvider>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Admin Chat" />

                    <div className="flex h-screen bg-background">
                        {/* Main Chat Area */}
                        <div className="flex flex-1 flex-col">
                            {/* Chat Header */}
                            <ChatHeader
                                selectedConversation={selectedConversation}
                                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                                isSidebarOpen={isSidebarOpen}
                            />

                            {/* Stats Bar */}
                            <div className="border-b bg-muted/30 px-4 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center space-x-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Active: {stats.active_conversations}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm font-medium">Waiting: {stats.waiting_conversations}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                Avg Response: {Math.round(stats.average_response_time / 60)}m
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Conversation List */}
                                <div className={`w-80 border-r bg-muted/20 transition-all duration-300 ${
                                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                                } md:translate-x-0`}>
                                    <ConversationList
                                        onConversationSelect={setSelectedConversation}
                                        selectedConversation={selectedConversation}
                                    />
                                </div>

                                {/* Chat Interface */}
                                <div className="flex-1 flex flex-col">
                                    {selectedConversation ? (
                                        <ChatInterface
                                            conversation={selectedConversation}
                                            onConversationUpdate={(updated) => {
                                                setSelectedConversation(updated);
                                            }}
                                        />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                                                <p className="text-muted-foreground">
                                                    Select a conversation from the list to start chatting
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <ChatSidebar
                            conversation={selectedConversation}
                            isOpen={false}
                            onClose={() => {}}
                        />
                    </div>
                </AppLayout>
            </ChatProvider>
        </NotificationProvider>
    );
}

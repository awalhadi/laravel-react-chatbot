import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ConversationList from '@/components/admin/chat/conversationList';
import ConversationView from '@/components/admin/chat/conversationView';
import { useBroadcast } from '@/hooks/useBroadcast';
import { Conversation, ChatUser, Message } from '@/types/chat';
import { store } from '@/lib/store';

interface DashboardProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
        };
        token: string;
    };
    initialData: {
        conversations?: {
            active: Conversation[];
            waiting: Conversation[];
            closed: Conversation[];
        };
        activeConversations?: Conversation[];
        waitingConversations?: Conversation[];
        availableAgents: ChatUser[];
    };
}

interface ChatSidebarProps {
    conversations: {
        active: Conversation[];
        waiting: Conversation[];
        closed: Conversation[];
    };
    activeTab: string;
    setActiveTab: (tab: string) => void;
    selectedConversation: Conversation | null;
    setSelectedConversation: (conversation: Conversation | null) => void;
    loading: boolean;
}

interface BroadcastData {
    conversation: Conversation;
    conversation_id: number;
    message: Message;
}

export default function Dashboard({ auth, initialData }: DashboardProps): React.JSX.Element {

    // store api token
    useEffect(() => {
        if (auth?.token) {
            store.setApiToken(auth.token);
        }
    }, [auth?.token]);

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [activeTab, setActiveTab] = useState<string>('active');

    // Mock useConversations hook since it doesn't exist yet
    const [conversations, setConversations] = useState(() => {
        // Handle different possible data structures
        if (initialData.conversations) {
            return initialData.conversations;
        }

        // If initialData has direct arrays, structure them properly
        if (initialData.activeConversations || initialData.waitingConversations) {
            return {
                active: initialData.activeConversations || [],
                waiting: initialData.waitingConversations || [],
                closed: []
            };
        }

        // Default empty structure
        return {
            active: [],
            waiting: [],
            closed: []
        };
    });
    const [loading, setLoading] = useState<boolean>(false);


    const updateConversation = (updatedConversation: Conversation): void => {
        setConversations(prev => ({
            active: prev.active.map((conv: Conversation) => conv.id === updatedConversation.id ? updatedConversation : conv),
            waiting: prev.waiting.map((conv: Conversation) => conv.id === updatedConversation.id ? updatedConversation : conv),
            closed: prev.closed.map((conv: Conversation) => conv.id === updatedConversation.id ? updatedConversation : conv),
        }));
    };

    const addMessage = (conversationId: number, message: Message): void => {
        // This would typically update the conversation's message count
        // For now, we'll just update the selected conversation if it matches
        if (selectedConversation?.id === conversationId) {
            // In a real implementation, you'd add the message to the conversation
            console.log('Message added to conversation:', conversationId, message);
        }
    };

    const assignConversation = (conversationId: number, userId: number): void => {
        // This would typically make an API call to assign the conversation
        console.log('Assigning conversation:', conversationId, 'to user:', userId);
    };

    const closeConversation = (conversationId: number): void => {
        // This would typically make an API call to close the conversation
        console.log('Closing conversation:', conversationId);
    };

    const refreshConversations = (): void => {
        setLoading(true);
        // This would typically fetch fresh data from the API
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // Set up real-time broadcasting
    useBroadcast({
        channels: ['admin.conversations'],
        events: {
            'conversation.status.changed': (data: BroadcastData) => {
                updateConversation(data.conversation);
            },
            'message.sent': (data: BroadcastData) => {
                addMessage(data.conversation_id, data.message);
            }
        }
    });

    return (
        <AppLayout>
            <Head title="Chat Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="flex h-screen">
                            {/* Sidebar */}
                            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                                <ChatSidebar
                                    conversations={conversations}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    selectedConversation={selectedConversation}
                                    setSelectedConversation={setSelectedConversation}
                                    loading={loading}
                                />
                            </div>

                            {/* Main Chat Area */}
                            <div className="flex-1 flex flex-col">
                                {selectedConversation ? (
                                    <ConversationView
                                        conversation={selectedConversation}
                                        onAssign={assignConversation}
                                        onClose={closeConversation}
                                        onMessageSent={addMessage}
                                        availableAgents={initialData.availableAgents}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">💬</div>
                                            <h3 className="text-lg font-medium">Select a conversation</h3>
                                            <p className="mt-2">Choose a conversation from the sidebar to start chatting</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Chat Sidebar Component
function ChatSidebar({
    conversations,
    activeTab,
    setActiveTab,
    selectedConversation,
    setSelectedConversation,
    loading
}: ChatSidebarProps): React.JSX.Element {
    const tabs = [
        { id: 'waiting', label: 'Waiting', count: conversations?.waiting?.length || 0 },
        { id: 'active', label: 'Active', count: conversations?.active?.length || 0 },
        { id: 'closed', label: 'Closed', count: conversations?.closed?.length || 0 }
    ];

    const handleConversationSelect = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : (
                    <>
                        <ConversationList
                            conversations={conversations?.[activeTab as keyof typeof conversations] || []}
                            selectedConversation={selectedConversation}
                            onConversationSelect={handleConversationSelect}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

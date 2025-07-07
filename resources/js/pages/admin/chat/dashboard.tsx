import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConversationList from '@/Components/Admin/Chat/ConversationList';
import ConversationView from '@/Components/Admin/Chat/ConversationView';
import { useBroadcast } from '@/Hooks/useBroadcast';
import { useConversations } from '@/Hooks/useConversations';

export default function Dashboard({ auth, initialData }) {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [activeTab, setActiveTab] = useState('active');

    const {
        conversations,
        loading,
        updateConversation,
        addMessage,
        assignConversation,
        closeConversation,
        refreshConversations
    } = useConversations(initialData);

    // Set up real-time broadcasting
    useBroadcast({
        channels: ['admin.conversations'],
        events: {
            'conversation.status.changed': (data) => {
                updateConversation(data.conversation);
            },
            'message.sent': (data) => {
                addMessage(data.conversation_id, data.message);
            }
        }
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Chat Management
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={refreshConversations}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            }
        >
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
        </AuthenticatedLayout>
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
}) {
    const tabs = [
        { id: 'active', label: 'Active', count: conversations.active?.length || 0 },
        { id: 'waiting', label: 'Waiting', count: conversations.waiting?.length || 0 },
        { id: 'closed', label: 'Closed', count: conversations.closed?.length || 0 }
    ];

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
                    <ConversationList
                        conversations={conversations[activeTab] || []}
                        selectedConversation={selectedConversation}
                        onConversationSelect={setSelectedConversation}
                    />
                )}
            </div>
        </div>
    );
}

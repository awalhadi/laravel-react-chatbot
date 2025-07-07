// resources/js/Components/Admin/Chat/ConversationList.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({
    conversations,
    selectedConversation,
    onConversationSelect
}) {
    if (conversations.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No conversations found
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onClick={() => onConversationSelect(conversation)}
                />
            ))}
        </div>
    );
}

function ConversationItem({ conversation, isSelected, onClick }) {
    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-yellow-100 text-yellow-800',
        urgent: 'bg-red-100 text-red-800'
    };

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        waiting: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800'
    };

    return (
        <div
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.reference_id}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[conversation.priority]}`}>
                            {conversation.priority}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[conversation.status]}`}>
                            {conversation.status}
                        </span>
                        <span className="text-xs text-gray-500">
                            {conversation.message_count} messages
                        </span>
                    </div>

                    {conversation.subject && (
                        <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.subject}
                        </p>
                    )}

                    {conversation.assigned_user && (
                        <p className="text-xs text-gray-500">
                            Assigned to: {conversation.assigned_user.name}
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-end space-y-1">
                    <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                    </p>
                    {conversation.last_message_at && (
                        <p className="text-xs text-gray-400">
                            Last: {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </p>
                    )}
                </div>
            </div>

            {conversation.tags && conversation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

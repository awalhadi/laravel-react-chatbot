// resources/js/Components/Admin/Chat/MessageList.jsx
import React from 'react';
import { format } from 'date-fns';

export default function MessageList({ messages }) {
    if (messages.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No messages yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
        </div>
    );
}

function MessageBubble({ message }) {
    const isGuest = message.sender_type === 'guest';
    const isBot = message.is_bot_message;
    const isInternalNote = message.is_internal_note;

    const getBubbleStyles = () => {
        if (isInternalNote) {
            return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800';
        }
        if (isBot) {
            return 'bg-purple-50 border-l-4 border-purple-400 text-purple-800';
        }
        if (isGuest) {
            return 'bg-gray-100 text-gray-800';
        }
        return 'bg-blue-500 text-white';
    };

    const getAlignment = () => {
        if (isInternalNote) return 'items-center';
        return isGuest ? 'items-start' : 'items-end';
    };

    return (
        <div className={`flex ${getAlignment()}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getBubbleStyles()}`}>
                {(isBot || isInternalNote) && (
                    <div className="text-xs font-medium mb-1">
                        {isInternalNote ? '📝 Internal Note' : '🤖 Bot'}
                    </div>
                )}

                <div className="text-sm font-medium mb-1">
                    {message.sender_name || 'Unknown'}
                </div>

                <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                </div>

                <div className="text-xs opacity-75 mt-1">
                    {format(new Date(message.timestamp), 'HH:mm')}
                    {message.read_at && (
                        <span className="ml-1">✓</span>
                    )}
                </div>
            </div>
        </div>
    );
}

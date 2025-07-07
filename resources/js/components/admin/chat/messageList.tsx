import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';
import {
    User,
    Bot,
    FileText,
    Check,
    CheckCheck,
    Clock,
    AlertCircle,
    Star,
    MessageSquare
} from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    currentUserId?: number;
}

interface MessageBubbleProps {
    message: Message;
    currentUserId?: number;
    isLastInGroup?: boolean;
    isFirstInGroup?: boolean;
}

export default function MessageList({ messages, currentUserId }: MessageListProps): React.JSX.Element {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation</p>
            </div>
        );
    }

    // Group messages by sender and time proximity
    const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
        const prevMessage = messages[index - 1];
        const timeDiff = prevMessage
            ? new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()
            : 0;

        const sameSender = prevMessage && prevMessage.sender_type === message.sender_type;
        const withinTimeWindow = timeDiff < 5 * 60 * 1000; // 5 minutes

        if (sameSender && withinTimeWindow) {
            groups[groups.length - 1].push(message);
        } else {
            groups.push([message]);
        }

        return groups;
    }, []);

    return (
        <div className="space-y-6 p-4">
            {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                    {group.map((message, messageIndex) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                            isFirstInGroup={messageIndex === 0}
                            isLastInGroup={messageIndex === group.length - 1}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function MessageBubble({
    message,
    currentUserId,
    isFirstInGroup = true,
    isLastInGroup = true
}: MessageBubbleProps): React.JSX.Element {
    const isGuest = message.sender_type === 'guest';
    const isBot = message.is_bot_message;
    const isInternalNote = message.is_internal_note;
    const isCurrentUser = message.sender_id === currentUserId;
    const isSystem = message.message_type === 'system';

    const getMessageConfig = () => {
        if (isInternalNote) {
            return {
                bgColor: 'bg-amber-50 border-amber-200',
                textColor: 'text-amber-800',
                icon: FileText,
                label: 'Internal Note',
                alignment: 'justify-center'
            };
        }
        if (isBot) {
            return {
                bgColor: 'bg-purple-50 border-purple-200',
                textColor: 'text-purple-800',
                icon: Bot,
                label: 'AI Assistant',
                alignment: 'justify-start'
            };
        }
        if (isSystem) {
            return {
                bgColor: 'bg-gray-50 border-gray-200',
                textColor: 'text-gray-600',
                icon: AlertCircle,
                label: 'System',
                alignment: 'justify-center'
            };
        }
        if (isGuest) {
            return {
                bgColor: 'bg-white border-gray-200',
                textColor: 'text-gray-800',
                icon: User,
                label: 'Guest',
                alignment: 'justify-start'
            };
        }
        return {
            bgColor: 'bg-blue-500 border-blue-500',
            textColor: 'text-white',
            icon: User,
            label: 'You',
            alignment: 'justify-end'
        };
    };

    const config = getMessageConfig();
    const Icon = config.icon;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getDeliveryStatus = () => {
        if (message.read_at) {
            return <CheckCheck className="w-3 h-3 text-blue-500" />;
        }
        if (message.delivered_at) {
            return <Check className="w-3 h-3 text-gray-400" />;
        }
        return <Clock className="w-3 h-3 text-gray-300" />;
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return format(date, 'HH:mm');
        } else {
            return format(date, 'MMM d, HH:mm');
        }
    };

    return (
        <div className={`flex ${config.alignment} ${!isFirstInGroup ? 'mt-1' : ''}`}>
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar - only show for first message in group */}
                {isFirstInGroup && !isInternalNote && !isSystem && (
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : isGuest
                                    ? 'bg-gray-300 text-gray-700'
                                    : 'bg-purple-500 text-white'
                        }`}>
                            {getInitials(message.sender_name || 'U')}
                        </div>
                    </div>
                )}

                {/* Message Content */}
                <div className={`flex-1 ${!isFirstInGroup && !isInternalNote && !isSystem ? 'ml-10' : ''}`}>
                    <div className={`rounded-lg border px-4 py-1 ${config.bgColor} ${config.textColor}`}>
                        {/* Message Header */}
                        {(isBot || isInternalNote || isSystem) && (
                            <div className="flex items-center space-x-2 mb-2">
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-medium">{config.label}</span>
                                {message.confidence_score && (
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3" />
                                        <span className="text-xs">
                                            {Math.round(message.confidence_score * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sender Name - only for first message in group */}
                        {isFirstInGroup && !isInternalNote && !isSystem && !isCurrentUser && (
                            <div className="text-xs font-medium mb-1 opacity-75">
                                {message.sender_name || 'Unknown'}
                            </div>
                        )}

                        {/* Message Content */}
                        <div className="text-sm text-left whitespace-pre-wrap leading-relaxed">
                            {message.content}
                        </div>

                        {/* Message Footer */}
                        <div className="flex items-center justify-end">
                            <div className="flex items-center pr-2">
                                <span className="text-xs opacity-60">
                                    {formatMessageTime(message.created_at)}
                                </span>

                                {message.is_edited && (
                                    <span className="text-xs opacity-60 italic">
                                        (edited)
                                    </span>
                                )}
                            </div>

                            {/* Delivery Status - only for current user's messages */}
                            {isCurrentUser && !isInternalNote && !isSystem && (
                                <div className="flex items-center">
                                    {getDeliveryStatus()}
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                <div className="text-xs opacity-75">
                                    📎 {message.attachments.length} attachment(s)
                                </div>
                            </div>
                        )}

                        {/* Intent/Requires Review */}
                        {message.intent && (
                            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                <div className="text-xs opacity-75">
                                    Intent: {message.intent}
                                </div>
                            </div>
                        )}

                        {message.requires_human_review && (
                            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                <div className="text-xs text-red-600 font-medium">
                                    ⚠️ Requires human review
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

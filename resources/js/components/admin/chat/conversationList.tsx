import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/types/chat';
import {
    Clock,
    MessageSquare,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    Tag,
    Star,
    Eye,
    EyeOff
} from 'lucide-react';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    onConversationSelect: (conversation: Conversation) => void;
}

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

export default function ConversationList({
    conversations,
    selectedConversation,
    onConversationSelect
}: ConversationListProps): React.JSX.Element {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No conversations found</p>
                <p className="text-sm text-gray-400">New conversations will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-1 p-2">
            {conversations.map((conversation: Conversation) => (
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

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps): React.JSX.Element {
    const priorityConfig = {
        low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        normal: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: MessageSquare },
        high: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
        urgent: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle }
    };

    const statusConfig = {
        active: { color: 'bg-green-100 text-green-700', text: 'Active' },
        waiting: { color: 'bg-yellow-100 text-yellow-700', text: 'Waiting' },
        closed: { color: 'bg-gray-100 text-gray-700', text: 'Closed' },
        archived: { color: 'bg-slate-100 text-slate-700', text: 'Archived' }
    };

    const priority = priorityConfig[conversation?.priority || 'low'];
    const status = statusConfig[conversation.status];
    const PriorityIcon = priority.icon;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return formatDistanceToNow(date, { addSuffix: true });
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div
            className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${
                isSelected
                    ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                    : 'bg-white border border-gray-100'
            }`}
            onClick={onClick}
        >
            {/* Unread indicator */}
            {conversation.unread_count && conversation.unread_count > 0 && (
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </span>
                </div>
            )}

            <div className="flex items-start space-x-3">
                {/* Avatar/Status Circle */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {conversation.assigned_user
                                ? getInitials(conversation.assigned_user.name)
                                : 'G'
                            }
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            conversation.status === 'active' ? 'bg-green-400' :
                            conversation.status === 'waiting' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {conversation.reference_id}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${priority.color}`}>
                                <PriorityIcon className="w-3 h-3 mr-1" />
                                {conversation.priority}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                {status.text}
                            </span>
                        </div>
                    </div>

                    {/* Subject/Preview */}
                    {conversation.subject && (
                        <p className="text-sm text-gray-700 font-medium mb-1 line-clamp-1">
                            {conversation.subject}
                        </p>
                    )}

                    {/* Last Message Preview */}
                    {conversation.last_message && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {conversation.last_message.content}
                        </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{conversation.message_count}</span>
                            </div>

                            {conversation.assigned_user && (
                                <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span className="truncate max-w-20">{conversation.assigned_user.name}</span>
                                </div>
                            )}

                            {conversation.response_time_seconds && (
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{Math.round(conversation.response_time_seconds)}s</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">
                                {formatTime(conversation.last_message_at || conversation.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    {conversation.tags && conversation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {conversation.tags.slice(0, 3).map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                            {conversation.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                    +{conversation.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-1">
                    {conversation.unread_count && conversation.unread_count > 0 ? (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                            <EyeOff className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

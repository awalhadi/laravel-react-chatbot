import { Conversation } from '@/types/chat';
import { Card } from '@/components/ui/card';

interface ChatSidebarProps {
    conversation: Conversation | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({ conversation, isOpen, onClose }: ChatSidebarProps) {
    if (!conversation) return null;
    return (
        <div className={`fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:static md:translate-x-0`}>
            <Card className="m-4 p-4">
                <div className="font-semibold text-lg mb-2">Conversation Details</div>
                <div className="mb-2 text-sm"><span className="font-medium">Reference:</span> {conversation.reference_id}</div>
                <div className="mb-2 text-sm"><span className="font-medium">Status:</span> {conversation.status}</div>
                <div className="mb-2 text-sm"><span className="font-medium">Priority:</span> {conversation.priority}</div>
                <div className="mb-2 text-sm"><span className="font-medium">Messages:</span> {conversation.message_count}</div>
                {/* Add more details as needed */}
            </Card>
        </div>
    );
}

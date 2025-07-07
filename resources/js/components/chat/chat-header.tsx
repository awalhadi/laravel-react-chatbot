import { Conversation } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface ChatHeaderProps {
    selectedConversation: Conversation | null;
    onSidebarToggle: () => void;
    isSidebarOpen: boolean;
}

export function ChatHeader({ selectedConversation, onSidebarToggle, isSidebarOpen }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onSidebarToggle} className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                {selectedConversation ? (
                    <>
                        <span className="font-semibold text-base">{selectedConversation.reference_id}</span>
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                            {selectedConversation.status}
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                            {selectedConversation.priority}
                        </span>
                    </>
                ) : (
                    <span className="font-semibold text-base text-muted-foreground">Select a conversation</span>
                )}
            </div>
            {/* Actions can go here */}
        </div>
    );
}

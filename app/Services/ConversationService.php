<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationMetric;
use App\Models\GuestSession;
use App\Models\Message;
use App\Models\User;

class ConversationService
{
    public function createGuestSession(array $data): GuestSession
    {
        return GuestSession::create([
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'browser_info' => $data['browser_info'] ?? null,
        ]);
    }

    public function getConversationHistory(Conversation $conversation, int $limit = 50): array
    {
        $messages = $conversation->messages()
            ->where('is_internal_note', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return [
            'conversation' => $conversation,
            'messages' => $messages,
            'guest_session' => $conversation->guestSession,
            'assigned_user' => $conversation->assignedUser,
        ];
    }

    public function sendUserMessage(Conversation $conversation, User $user, string $content): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'user',
            'sender_id' => $user->id,
            'sender_name' => $user->name,
            'content' => $content,
            'message_type' => 'text',
            'delivered_at' => now(),
        ]);

        $conversation->incrementMessageCount();
        $user->updateLastActive();

        return $message;
    }

    public function addInternalNote(Conversation $conversation, User $user, string $note): Message
    {
        return Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'user',
            'sender_id' => $user->id,
            'sender_name' => $user->name,
            'content' => $note,
            'message_type' => 'text',
            'is_internal_note' => true,
            'delivered_at' => now(),
        ]);
    }

    public function closeConversation(Conversation $conversation, User $user): void
    {
        $conversation->close();

        // Create metrics
        ConversationMetric::calculateForConversation($conversation);

        // Send closing message
        $this->sendUserMessage($conversation, $user, 'This conversation has been closed. Thank you for contacting us!');
    }

    public function getActiveConversations(User $user = null): array
    {
        $query = Conversation::with(['guestSession', 'assignedUser'])
            ->where('status', 'active')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc');

        if ($user) {
            $query->where('assigned_user_id', $user->id);
        }

        return $query->get()->toArray();
    }

    public function getWaitingConversations(): array
    {
        return Conversation::with(['guestSession'])
            ->where('status', 'waiting')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->toArray();
    }
}

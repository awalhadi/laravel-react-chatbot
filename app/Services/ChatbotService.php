<?php

namespace App\Services;

use App\Models\BotResponse;
use App\Models\Conversation;
use App\Models\GuestSession;
use App\Models\Message;
use App\Models\User;

class ChatbotService
{
    public function processGuestMessage(GuestSession $guestSession, string $content): array
    {
        // Get or create conversation
        $conversation = $this->getOrCreateConversation($guestSession);

        // Save guest message
        $guestMessage = $this->saveMessage($conversation, [
            'sender_type' => 'guest',
            'sender_id' => $guestSession->id,
            'content' => $content,
            'message_type' => 'text',
        ]);

        // Try to get bot response
        $botResponse = $this->getBotResponse($content);

        if ($botResponse) {
            // Save bot response
            $botMessage = $this->saveMessage($conversation, [
                'sender_type' => 'bot',
                'content' => $botResponse['response'],
                'is_bot_message' => true,
                'confidence_score' => $botResponse['confidence'],
                'intent' => $botResponse['intent'],
                'requires_human_review' => $botResponse['confidence'] < 0.8,
            ]);

            return [
                'guest_message' => $guestMessage,
                'bot_message' => $botMessage,
                'requires_human' => $botResponse['confidence'] < 0.8,
            ];
        }

        // No bot response found, escalate to human
        $this->escalateToHuman($conversation);

        return [
            'guest_message' => $guestMessage,
            'bot_message' => null,
            'requires_human' => true,
        ];
    }

    private function getOrCreateConversation(GuestSession $guestSession): Conversation
    {
        $conversation = $guestSession->conversations()
            ->where('status', 'active')
            ->first();
        if (!$conversation) {
            $conversation = Conversation::create([
                'guest_session_id' => $guestSession->id,
                'status' => 'active',
                'priority' => 'normal',
                'first_message_at' => now(),
            ]);
        }

        return $conversation;
    }

    private function saveMessage(Conversation $conversation, array $data): Message
    {
        $data['conversation_id'] = $conversation->id;
        $data['delivered_at'] = now();

        $message = Message::create($data);
        $conversation->incrementMessageCount();

        return $message;
    }

    private function getBotResponse(string $content): ?array
    {
        $responses = BotResponse::active()
            ->byPriority()
            ->get();

        foreach ($responses as $response) {
            if (preg_match('/' . $response->trigger_pattern . '/i', $content)) {
                $response->incrementUsage();

                return [
                    'response' => $response->getRandomResponse(),
                    'confidence' => $this->calculateConfidence($content, $response->trigger_pattern),
                    'intent' => $response->intent,
                ];
            }
        }

        return null;
    }

    private function calculateConfidence(string $content, string $pattern): float
    {
        // Simple confidence calculation based on pattern matching
        $matches = [];
        preg_match_all('/' . $pattern . '/i', $content, $matches);

        return min(count($matches[0]) * 0.3 + 0.5, 1.0);
    }

    private function escalateToHuman(Conversation $conversation): void
    {
        $conversation->update(['status' => 'waiting']);

        // Find available agent
        $availableAgent = User::where('status', 'active')
            ->where('role', 'agent')
            ->first();

        if ($availableAgent) {
            $conversation->assignToUser($availableAgent);
        }
    }
}

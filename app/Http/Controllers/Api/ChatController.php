<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\GuestSession;
use App\Services\ChatbotService;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function __construct(
        private ChatbotService $chatbotService,
        private ConversationService $conversationService
    ) {}

    public function initializeSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_agent' => 'nullable|string',
            'browser_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $guestSession = $this->conversationService->createGuestSession([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'browser_info' => $request->input('browser_info', []),
        ]);

        return response()->json([
            'session_id' => $guestSession->session_id,
            'expires_at' => $guestSession->expires_at,
        ]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|uuid|exists:guest_sessions,session_id',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $guestSession = GuestSession::where('session_id', $request->session_id)->with('conversations')->first();

        if ($guestSession->isExpired()) {
            return response()->json([
                'error' => 'Session expired',
                'message' => 'Your session has expired. Please refresh the page to start a new conversation.'
            ], 401);
        }

        $guestSession->extendSession();
        $result = $this->chatbotService->processGuestMessage($guestSession, $request->message);

        $response = [
            'guest_message' => [
                'id' => $result['guest_message']->id,
                'content' => $result['guest_message']->content,
                'timestamp' => $result['guest_message']->created_at,
            ],
            'requires_human' => $result['requires_human'],
        ];

        if ($result['bot_message']) {
            $response['bot_message'] = [
                'id' => $result['bot_message']->id,
                'content' => $result['bot_message']->content,
                'timestamp' => $result['bot_message']->created_at,
            ];
        } else {
            $response['system_message'] = 'Thank you for your message. An agent will be with you shortly.';
        }

        return response()->json($response);
    }

    public function getConversationHistory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|uuid|exists:guest_sessions,session_id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $guestSession = GuestSession::where('session_id', $request->session_id)->first();
        $conversation = $guestSession->conversations()->where('status', 'active')->first();

        if (!$conversation) {
            return response()->json([
                'messages' => [],
                'conversation_status' => 'no_active_conversation'
            ]);
        }

        $history = $this->conversationService->getConversationHistory(
            $conversation,
            $request->input('limit', 50)
        );

        $messages = $history['messages']->map(function ($message) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name,
                'timestamp' => $message->created_at,
                'is_bot_message' => $message->is_bot_message,
            ];
        });

        return response()->json([
            'messages' => $messages,
            'conversation_status' => $conversation->status,
            'reference_id' => $conversation->reference_id,
        ]);
    }

    public function markMessagesAsRead(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|uuid|exists:guest_sessions,session_id',
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer|exists:messages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $guestSession = GuestSession::where('session_id', $request->session_id)->first();
        $conversation = $guestSession->conversations()->where('status', 'active')->first();

        if (!$conversation) {
            return response()->json(['error' => 'No active conversation'], 404);
        }

        $conversation->messages()
            ->whereIn('id', $request->message_ids)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}

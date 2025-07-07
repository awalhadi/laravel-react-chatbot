<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AdminChatController extends Controller
{
    public function __construct(
        private ConversationService $conversationService
    ) {
        // $this->middleware('auth:sanctum');
    }

    public function getActiveConversations(): JsonResponse
    {
        $user = Auth::user();
        $conversations = $this->conversationService->getActiveConversations($user);

        return response()->json([
            'conversations' => $conversations,
            'total' => count($conversations)
        ]);
    }

    public function getWaitingConversations(): JsonResponse
    {
        $conversations = $this->conversationService->getWaitingConversations();

        return response()->json([
            'conversations' => $conversations,
            'total' => count($conversations)
        ]);
    }

    public function getConversationDetails(Conversation $conversation): JsonResponse
    {
        // $this->authorize('view', $conversation);

        $history = $this->conversationService->getConversationHistory($conversation);

        $messages = $history['messages']->map(function ($message) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name ?? 'Guest',
                'created_at' => $message->created_at,
                'is_bot_message' => $message->is_bot_message,
                'is_internal_note' => $message->is_internal_note,
                'read_at' => $message->read_at,
            ];
        });

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
            'guest_session' => $history['guest_session'],
        ]);
    }

    public function assignConversation(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('assign', $conversation);

        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $userId = $request->input('user_id', Auth::id());
        $assignedUser = \App\Models\User::find($userId);

        $conversation->assignToUser($assignedUser);

        return response()->json([
            'message' => 'Conversation assigned successfully',
            'conversation' => $conversation->fresh()
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
            'is_internal_note' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'message' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $isInternalNote = $request->boolean('is_internal_note', false);

        if ($isInternalNote) {
            $message = $this->conversationService->addInternalNote(
                $conversation,
                $user,
                $request->message
            );
        } else {
            $message = $this->conversationService->sendUserMessage(
                $conversation,
                $user,
                $request->message
            );
        }


        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name,
                'created_at' => $message->created_at,
                'is_bot_message' => $message->is_bot_message,
                'is_internal_note' => $message->is_internal_note,
                'read_at' => $message->read_at,
            ]
        ]);
    }

    public function closeConversation(Conversation $conversation): JsonResponse
    {
        $this->authorize('close', $conversation);

        $user = Auth::user();
        $this->conversationService->closeConversation($conversation, $user);

        return response()->json([
            'message' => 'Conversation closed successfully'
        ]);
    }

    public function updateConversationStatus(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('update', $conversation);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,waiting,closed,archived',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'tags' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid data',
                'messages' => $validator->errors()
            ], 422);
        }

        $updateData = ['status' => $request->status];

        if ($request->has('priority')) {
            $updateData['priority'] = $request->priority;
        }

        if ($request->has('tags')) {
            $updateData['tags'] = $request->tags;
        }

        $conversation->update($updateData);

        return response()->json([
            'message' => 'Conversation updated successfully',
            'conversation' => $conversation->fresh()
        ]);
    }

    public function getStats(): JsonResponse
    {
        $user = Auth::user();

        $stats = [
            'total_conversations' => Conversation::count(),
            'active_conversations' => Conversation::where('status', 'active')->count(),
            'waiting_conversations' => Conversation::where('status', 'waiting')->count(),
            'closed_conversations' => Conversation::where('status', 'closed')->count(),
            'average_response_time' => $this->calculateAverageResponseTime(),
            'total_messages' => Message::count(),
            'unread_messages' => Message::whereNull('read_at')->where('sender_type', 'guest')->count(),
        ];

        return response()->json($stats);
    }

    public function getConversations(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Conversation::with(['guestSession', 'assignedUser', 'messages' => function($q) {
            $q->latest()->limit(1);
        }]);

        // Apply filters
        if ($request->has('status')) {
            $query->whereIn('status', explode(',', $request->status));
        }

        if ($request->has('priority')) {
            $query->whereIn('priority', explode(',', $request->priority));
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_user_id', $request->assigned_to);
        }

        if ($request->has('search')) {
            $query->where('reference_id', 'like', '%' . $request->search . '%');
        }

        $conversations = $query->orderBy('created_at', 'desc')->paginate(20);

        // Add unread count for each conversation
        $conversations->getCollection()->transform(function ($conversation) {
            $conversation->unread_count = $conversation->messages()
                ->where('sender_type', 'guest')
                ->whereNull('read_at')
                ->count();
            return $conversation;
        });

        return response()->json($conversations);
    }

    public function getMessages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function markMessageAsRead(Request $request, Message $message): JsonResponse
    {
        $message->markAsRead();

        return response()->json(['message' => 'Message marked as read']);
    }

    public function getUsers(): JsonResponse
    {
        $users = User::whereIn('role', ['admin', 'agent', 'super_admin'])
            ->select(['id', 'name', 'email', 'role', 'status', 'is_online', 'last_seen_at'])
            ->get();

        return response()->json($users);
    }

    public function getOnlineUsers(): JsonResponse
    {
        $users = User::whereIn('role', ['admin', 'agent', 'super_admin'])
            ->where('is_online', true)
            ->select(['id', 'name', 'email', 'role', 'status'])
            ->get();

        return response()->json($users);
    }

    public function getNotifications(Request $request): JsonResponse
    {
        $user = Auth::user();

        $notifications = collect(); // Placeholder - implement actual notification system

        return response()->json($notifications);
    }

    public function markNotificationAsRead(Request $request, $notificationId): JsonResponse
    {
        // Placeholder - implement actual notification system
        return response()->json(['message' => 'Notification marked as read']);
    }

    private function calculateAverageResponseTime(): float
    {
        $conversations = Conversation::whereNotNull('response_time_seconds')->get();

        if ($conversations->isEmpty()) {
            return 0;
        }

        return $conversations->avg('response_time_seconds') ?? 0;
    }
}

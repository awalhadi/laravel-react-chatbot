<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Message;
use App\Events\MessageSent;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\ConversationService;
use Illuminate\Support\Facades\Validator;

class AdminChatController extends Controller
{
    public function __construct(
        private ConversationService $conversationService
    ) {
        // $this->middleware('auth:sanctum');
    }
    // admin chat
    public function index(): Response
    {
        $user = Auth::user();
        $conversations = $this->conversationService->getActiveConversations($user);
        $waitingConversations = $this->conversationService->getWaitingConversations();
        $availableAgents = User::where('status', 'active')
            ->whereIn('role', ['agent', 'admin'])
            ->get();
        // dd($availableAgents, $conversations, $waitingConversations);
        // Check if the user model supports API tokens before attempting to create one
        $token = $user->createToken('admin-chat')->plainTextToken;

        return Inertia::render('admin/chat/dashboard', [
            'auth' => [
                'user' => $user,
                'token' => $token,
            ],
            'initialData' => [
                'conversations' => [
                    'active' => $conversations,
                    'waiting' => $waitingConversations,
                    'closed' => $availableAgents,
                ],
            ],
        ]);
    }

    public function conversation(Conversation $conversation): Response
    {
        $user = Auth::user();
        $conversations = $this->conversationService->getActiveConversations($user);
        $waitingConversations = $this->conversationService->getWaitingConversations();
        $availableAgents = User::where('status', 'active')
            ->whereIn('role', ['agent', 'admin'])
            ->get();

        $history = $this->conversationService->getConversationHistory($conversation);

        // return Inertia::render('admin/chat/conversation', [
        //     'conversation' => $conversation,
        //     'messages' => $history['messages'],
        //     'guestSession' => $history['guest_session'],
        //     'assignedUser' => $history['assigned_user'],
        // ]);
        // return Inertia::render('admin/chat/conversation', [
        //     'conversation' => $conversation,
        //     'messages' => $history['messages'],
        //     'guestSession' => $history['guest_session'],
        //     'assignedUser' => $history['assigned_user'],
        // ]);

        return Inertia::render('admin/chat/dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'initialData' => [
                'conversations' => [
                    'active' => $conversations,
                    'waiting' => $waitingConversations,
                    'closed' => $availableAgents,
                ],
            ],
        ]);
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
                'messages' => $validator->errors()
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

        // Broadcast the event
        broadcast(new MessageSent($message));

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name,
                'timestamp' => $message->created_at,
                'is_internal_note' => $message->is_internal_note,
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

    private function calculateAverageResponseTime(): float
    {
        $conversations = Conversation::whereNotNull('response_time_seconds')->get();

        if ($conversations->isEmpty()) {
            return 0;
        }

        return $conversations->avg('response_time_seconds') ?? 0;
    }

}

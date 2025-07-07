<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\AdminChatController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Guest Chat API Routes
Route::prefix('chat')->group(function () {
    Route::post('initialize', [ChatController::class, 'initializeSession']);
    Route::post('send', [ChatController::class, 'sendMessage']);
    Route::get('history', [ChatController::class, 'getConversationHistory']);
    Route::post('mark-read', [ChatController::class, 'markMessagesAsRead']);
});

// Admin Chat API Routes
Route::prefix('admin/chat')->middleware('auth:sanctum')->group(function () {
    // Dashboard Stats
    Route::get('stats', [AdminChatController::class, 'getStats']);

    // Conversations
    Route::get('conversations', [AdminChatController::class, 'getConversations']);
    Route::get('conversations/active', [AdminChatController::class, 'getActiveConversations']);
    Route::get('conversations/waiting', [AdminChatController::class, 'getWaitingConversations']);
    Route::get('conversations/{conversation}', [AdminChatController::class, 'getConversationDetails']);
    Route::post('conversations/{conversation}/assign', [AdminChatController::class, 'assignConversation']);
    Route::post('conversations/{conversation}/send', [AdminChatController::class, 'sendMessage']);
    Route::post('conversations/{conversation}/close', [AdminChatController::class, 'closeConversation']);
    Route::put('conversations/{conversation}/status', [AdminChatController::class, 'updateConversationStatus']);

    // Messages
    Route::get('conversations/{conversation}/messages', [AdminChatController::class, 'getMessages']);
    Route::post('conversations/{conversation}/messages', [AdminChatController::class, 'sendMessage']);
    Route::put('messages/{message}/read', [AdminChatController::class, 'markMessageAsRead']);

    // Users
    Route::get('users', [AdminChatController::class, 'getUsers']);
    Route::get('users/online', [AdminChatController::class, 'getOnlineUsers']);

    // Notifications
    Route::get('notifications', [AdminChatController::class, 'getNotifications']);
    Route::put('notifications/{notification}/read', [AdminChatController::class, 'markNotificationAsRead']);
 });

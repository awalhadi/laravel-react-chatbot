<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for conversation messages
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Add your authorization logic here
    // For example, check if user belongs to this conversation
    return $user->canAccessConversation($conversationId);

    // Or for testing purposes, return true
    // return true;
});

// Presence channel example (if you need online users)
Broadcast::channel('conversation.{conversationId}.presence', function ($user, $conversationId) {
    if ($user->canAccessConversation($conversationId)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
});

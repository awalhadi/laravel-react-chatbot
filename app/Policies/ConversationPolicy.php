<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        // Users can view conversations assigned to them or if they're admins
        return $user->role === 'admin' ||
               $user->role === 'super_admin' ||
               $conversation->assigned_user_id === $user->id;
    }

    public function assign(User $user, Conversation $conversation): bool
    {
        // Admins and super admins can assign conversations
        return in_array($user->role, ['admin', 'super_admin']);
    }

    public function respond(User $user, Conversation $conversation): bool
    {
        // Users can respond to conversations assigned to them
        return $user->role === 'admin' ||
               $user->role === 'super_admin' ||
               $conversation->assigned_user_id === $user->id;
    }

    public function close(User $user, Conversation $conversation): bool
    {
        // Users can close conversations assigned to them
        return $user->role === 'admin' ||
               $user->role === 'super_admin' ||
               $conversation->assigned_user_id === $user->id;
    }

    public function update(User $user, Conversation $conversation): bool
    {
        // Admins and super admins can update conversation details
        return in_array($user->role, ['admin', 'super_admin']);
    }
}

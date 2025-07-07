<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\GuestSession;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_type',
        'sender_id',
        'sender_name',
        'content',
        'message_type',
        'attachments',
        'is_bot_message',
        'confidence_score',
        'intent',
        'requires_human_review',
        'delivered_at',
        'read_at',
        'is_internal_note',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_bot_message' => 'boolean',
        'requires_human_review' => 'boolean',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'is_internal_note' => 'boolean',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        if ($this->sender_type === 'user') {
            return $this->belongsTo(User::class, 'sender_id');
        } elseif ($this->sender_type === 'guest') {
            return $this->belongsTo(GuestSession::class, 'sender_id');
        }
        return null;
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsDelivered(): void
    {
        if (!$this->delivered_at) {
            $this->update(['delivered_at' => now()]);
        }
    }

    public function isFromBot(): bool
    {
        return $this->is_bot_message || $this->sender_type === 'bot';
    }

    public function isFromGuest(): bool
    {
        return $this->sender_type === 'guest';
    }

    public function isFromUser(): bool
    {
        return $this->sender_type === 'user';
    }
}

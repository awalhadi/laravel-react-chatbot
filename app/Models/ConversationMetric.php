<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'total_messages',
        'guest_messages',
        'bot_messages',
        'human_messages',
        'avg_response_time_seconds',
        'customer_satisfaction_score',
        'was_resolved',
        'resolution_category',
    ];

    protected $casts = [
        'was_resolved' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public static function calculateForConversation(Conversation $conversation): self
    {
        $messages = $conversation->messages;

        $metrics = new self([
            'conversation_id' => $conversation->id,
            'total_messages' => $messages->count(),
            'guest_messages' => $messages->where('sender_type', 'guest')->count(),
            'bot_messages' => $messages->where('sender_type', 'bot')->count(),
            'human_messages' => $messages->where('sender_type', 'user')->count(),
        ]);

        $metrics->save();
        return $metrics;
    }
}

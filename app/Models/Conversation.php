<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_id',
        'guest_session_id',
        'assigned_user_id',
        'status',
        'priority',
        'subject',
        'tags',
        'first_message_at',
        'last_message_at',
        'closed_at',
        'assigned_at',
        'message_count',
        'response_time_seconds',
    ];

    protected $casts = [
        'tags' => 'array',
        'first_message_at' => 'datetime',
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
        'assigned_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->reference_id) {
                $model->reference_id = 'CHAT-' . now()->format('Y') . '-' . str_pad(
                    static::whereYear('created_at', now()->year)->count() + 1,
                    6,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function guestSession(): BelongsTo
    {
        return $this->belongsTo(GuestSession::class, 'guest_session_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function metrics(): HasOne
    {
        return $this->hasOne(ConversationMetric::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function assignToUser(User $user): void
    {
        $this->update([
            'assigned_user_id' => $user->id,
            'assigned_at' => now(),
            'status' => 'active'
        ]);
    }

    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now()
        ]);
    }

    public function incrementMessageCount(): void
    {
        $this->increment('message_count');
        $this->update(['last_message_at' => now()]);
    }
}

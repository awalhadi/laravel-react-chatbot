<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuestSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'ip_address',
        'user_agent',
        'browser_info',
        'expires_at',
    ];

    protected $casts = [
        'browser_info' => 'array',
        'expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->session_id) {
                $model->session_id = Str::uuid();
            }
            if (!$model->expires_at) {
                $model->expires_at = now()->addHours(24);
            }
        });
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'guest_session_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id')->where('sender_type', 'guest');
    }

    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    public function extendSession(): void
    {
        $this->update(['expires_at' => now()->addHours(24)]);
    }
}

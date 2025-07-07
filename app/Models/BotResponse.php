<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BotResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'trigger_pattern',
        'response_text',
        'response_variations',
        'intent',
        'priority',
        'is_active',
        'usage_count',
    ];

    protected $casts = [
        'response_variations' => 'array',
        'is_active' => 'boolean',
    ];

    public function getRandomResponse(): string
    {
        $variations = $this->response_variations ?? [];
        $allResponses = array_merge([$this->response_text], $variations);

        return $allResponses[array_rand($allResponses)];
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'sender_type' => $this->sender_type,
            'sender_name' => $this->sender_name ?? 'Guest',
            'message_type' => $this->message_type,
            'attachments' => $this->attachments,
            'is_bot_message' => $this->is_bot_message,
            'is_internal_note' => $this->is_internal_note,
            'confidence_score' => $this->confidence_score,
            'intent' => $this->intent,
            'delivered_at' => $this->delivered_at,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

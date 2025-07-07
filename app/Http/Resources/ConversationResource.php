<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
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
            'reference_id' => $this->reference_id,
            'status' => $this->status,
            'priority' => $this->priority,
            'subject' => $this->subject,
            'tags' => $this->tags,
            'message_count' => $this->message_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_message_at' => $this->last_message_at,
            'closed_at' => $this->closed_at,
            'assigned_user' => new UserResource($this->whenLoaded('assignedUser')),
            'guest_session' => [
                'id' => $this->guestSession->id,
                'session_id' => $this->guestSession->session_id,
                'ip_address' => $this->guestSession->ip_address,
                'created_at' => $this->guestSession->created_at,
            ],
            'latest_messages' => MessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}

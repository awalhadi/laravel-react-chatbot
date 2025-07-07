<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;

class ProcessBotResponse  implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Message $message
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ChatbotService $chatbotService): void
    {
        if ($this->message->sender_type !== 'guest') {
            return;
        }

        $conversation = $this->message->conversation;
        $guestSession = $conversation->guestSession;

        // Process the message for bot response
        $chatbotService->processGuestMessage($guestSession, $this->message->content);
    }
}

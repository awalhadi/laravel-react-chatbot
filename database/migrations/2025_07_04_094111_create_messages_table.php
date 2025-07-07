<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');

            // Sender identification
            $table->enum('sender_type', ['guest', 'user', 'bot', 'system']);
            $table->unsignedBigInteger('sender_id')->nullable(); // user_id or guest_session_id
            $table->string('sender_name')->nullable(); // Display name for guests

            // Message content
            $table->text('content');
            $table->enum('message_type', ['text', 'image', 'file', 'system'])->default('text');
            $table->json('attachments')->nullable();

            // Bot/AI related
            $table->boolean('is_bot_message')->default(false);
            $table->decimal('confidence_score', 5, 4)->nullable();
            $table->string('intent')->nullable(); // detected intent
            $table->boolean('requires_human_review')->default(false);

            // Status tracking
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();

            // Internal flags
            $table->boolean('is_internal_note')->default(false); // admin-only notes
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();

            $table->timestamps();

            // Optimized indexes
            $table->index(['conversation_id', 'created_at']);
            $table->index(['sender_type', 'sender_id']);
            $table->index(['is_bot_message', 'requires_human_review']);
            $table->index(['delivered_at', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};

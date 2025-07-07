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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id')->unique(); // e.g., "CHAT-2024-001234"
            $table->foreignId('guest_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Conversation state
            $table->enum('status', ['active', 'waiting', 'closed', 'archived'])->default('active');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->string('subject')->nullable();
            $table->json('tags')->nullable(); // ['support', 'billing', 'technical']

            // Timing
            $table->timestamp('first_message_at')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('assigned_at')->nullable();

            // Metrics
            $table->integer('message_count')->default(0);
            $table->integer('response_time_seconds')->nullable(); // avg response time

            $table->timestamps();

            // Indexes for common queries
            $table->index(['status', 'priority', 'created_at']);
            $table->index(['assigned_user_id', 'status']);
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};

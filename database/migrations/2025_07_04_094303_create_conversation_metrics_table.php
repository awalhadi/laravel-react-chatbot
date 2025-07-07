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
        Schema::create('conversation_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->integer('total_messages');
            $table->integer('guest_messages');
            $table->integer('bot_messages');
            $table->integer('human_messages');
            $table->integer('avg_response_time_seconds');
            $table->decimal('customer_satisfaction_score', 3, 2)->nullable();
            $table->boolean('was_resolved')->default(false);
            $table->string('resolution_category')->nullable();
            $table->timestamps();

            $table->index(['was_resolved', 'created_at']);
            $table->index('customer_satisfaction_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_metrics');
    }
};

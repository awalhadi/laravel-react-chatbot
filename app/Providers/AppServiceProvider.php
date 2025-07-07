<?php

namespace App\Providers;

use App\Events\MessageSent;
use App\Listeners\BroadcastMessageSent;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    protected $listen = [
        MessageSent::class => [
            BroadcastMessageSent::class,
        ],
    ];

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

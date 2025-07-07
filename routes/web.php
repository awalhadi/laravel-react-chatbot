<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Admin\AdminChatController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin Chat Routes
    // Route::prefix('admin')->group(function () {
    //     Route::get('chat', function () {
    //         return Inertia::render('admin/chat');
    //     })->name('admin.chat');
    // });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/chat', [AdminChatController::class, 'index'])->name('chat.dashboard');
    });


});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

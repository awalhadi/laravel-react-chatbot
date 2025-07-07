<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateGuestSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionId = $request->input('session_id') ?? $request->header('X-Session-ID');

        if (!$sessionId) {
            return response()->json([
                'error' => 'Session ID is required'
            ], 401);
        }

        $guestSession = GuestSession::where('session_id', $sessionId)->first();

        if (!$guestSession) {
            return response()->json([
                'error' => 'Invalid session'
            ], 401);
        }

        if ($guestSession->isExpired()) {
            return response()->json([
                'error' => 'Session expired'
            ], 401);
        }

        $request->attributes->set('guest_session', $guestSession);

        return $next($request);
    }
}

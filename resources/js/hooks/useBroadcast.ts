// resources/js/Hooks/useBroadcast.js
import { useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

const getEcho = () => {
    if (!echoInstance) {
        echoInstance = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            auth: {
                headers: {
                    'Authorization': `Bearer ${document.querySelector('meta[name="api-token"]')?.getAttribute('content')}`,
                },
            },
        });
    }
    return echoInstance;
};

export function useBroadcast({ channels = [], events = {} }) {
    const channelRefs = useRef([]);
    const echo = getEcho();

    useEffect(() => {
        // Subscribe to channels
        channels.forEach(channelName => {
            const channel = echo.channel(channelName);
            channelRefs.current.push(channel);

            // Bind events
            Object.entries(events).forEach(([eventName, handler]) => {
                channel.listen(eventName, handler);
            });
        });

        // Cleanup function
        return () => {
            channelRefs.current.forEach(channel => {
                Object.keys(events).forEach(eventName => {
                    channel.stopListening(eventName);
                });
                echo.leaveChannel(channel.name);
            });
            channelRefs.current = [];
        };
    }, [channels.join(','), Object.keys(events).join(',')]);

    return echo;
}

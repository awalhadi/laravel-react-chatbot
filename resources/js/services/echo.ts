import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssHost: import.meta.env.VITE_PUSHER_HOST,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME === 'https') ? true : false,
    enabledTransports: ['ws', 'wss'],
})

window.Echo = echo;

export default echo;

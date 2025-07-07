import Echo from 'laravel-echo';
import Pusher from 'pusher-js';


window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY || 'your-pusher-key',
    cluster: process.env.MIX_PUSHER_APP_CLUSTER || 'mt1',
    forceTLS: true,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('')}`, // Your auth token
        },
    },
});


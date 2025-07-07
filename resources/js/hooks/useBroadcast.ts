import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';

// Extend Window interface to include Pusher
declare global {
    interface Window {
        Pusher: typeof Pusher;
    }

    interface ImportMeta {
        env: {
            VITE_PUSHER_APP_KEY: string;
            VITE_PUSHER_APP_CLUSTER: string;
        };
    }
}

// Basic Echo interface since laravel-echo types might not be available
interface Echo {
    channel: (channelName: string) => EchoChannel;
    leaveChannel: (channelName: string) => void;
}

interface EchoChannel {
    name: string;
    listen: (event: string, callback: (data: any) => void) => void;
    stopListening: (event: string) => void;
}

window.Pusher = Pusher;

let echoInstance: Echo | null = null;

interface BroadcastConfig {
    channels?: string[];
    events?: Record<string, (data: any) => void>;
}

const getEcho = async (): Promise<Echo> => {
    if (!echoInstance) {
        try {
            // Dynamic import to avoid type issues
            // @ts-ignore - Dynamic import of laravel-echo
            const LaravelEcho = await import('laravel-echo');
            const Echo = LaravelEcho.default || LaravelEcho;

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
            }) as Echo;
        } catch (error) {
            console.error('Failed to initialize Laravel Echo:', error);
            throw new Error('Laravel Echo initialization failed');
        }
    }
    return echoInstance;
};

export function useBroadcast({ channels = [], events = {} }: BroadcastConfig): Echo | null {
    const channelRefs = useRef<EchoChannel[]>([]);
    const [echo, setEcho] = useState<Echo | null>(null);

    useEffect(() => {
        let mounted = true;

        const initializeEcho = async () => {
            try {
                const echoInstance = await getEcho();
                if (mounted) {
                    setEcho(echoInstance);
                }
            } catch (error) {
                console.error('Failed to initialize Echo in useBroadcast:', error);
            }
        };

        initializeEcho();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!echo) return;

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
    }, [echo, channels.join(','), Object.keys(events).join(',')]);

    return echo;
}

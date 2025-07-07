// resources/js/Components/Admin/Chat/Notification.tsx
import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
    show?: boolean;
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

export default function Notification({
    type = 'info',
    title,
    message,
    show = false,
    onClose,
    autoClose = true,
    duration = 5000
}: NotificationProps) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);

        if (show && autoClose) {
            const timer = setTimeout(() => {
                setVisible(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, autoClose, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <Transition show={visible}>
            <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
                <Transition.Child
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`border rounded-lg p-4 shadow-lg ${getBackgroundColor()}`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {getIcon()}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                {title && (
                                    <p className="text-sm font-medium text-gray-900">
                                        {title}
                                    </p>
                                )}
                                {message && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {message}
                                    </p>
                                )}
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button
                                    onClick={() => {
                                        setVisible(false);
                                        onClose?.();
                                    }}
                                    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    );
}

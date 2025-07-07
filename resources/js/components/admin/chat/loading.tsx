import React from 'react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export default function Loading({ size = 'md', text = 'Loading...' }: LoadingProps): React.JSX.Element {
    const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
                <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
                <span className="text-gray-600">{text}</span>
            </div>
        </div>
    );
}

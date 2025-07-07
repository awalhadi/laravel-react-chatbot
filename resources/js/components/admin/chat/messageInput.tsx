// resources/js/Components/Admin/Chat/MessageInput.tsx
import React, { useState, useRef, FormEvent, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string, isInternalNote: boolean) => void;
    disabled?: boolean;
    loading?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false, loading = false }: MessageInputProps): React.JSX.Element {
    const [message, setMessage] = useState<string>('');
    const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim(), isInternalNote);
            setMessage('');
            setIsInternalNote(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const formEvent = e as unknown as FormEvent<HTMLFormElement>;
            handleSubmit(formEvent);
        }
    };

    return (
        <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="space-y-2">
                {/* <div className="flex items-center space-x-2 mb-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                            Internal Note
                        </span>
                    </label>
                </div> */}

                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isInternalNote ? "Add internal note..." : "Type your message..."}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                isInternalNote ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                            }`}
                            rows={3}
                            disabled={disabled}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={disabled || !message.trim()}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            disabled || !message.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isInternalNote
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

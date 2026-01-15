import { Bot, User, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
    onSpeak?: (text: string) => void;
    onStopSpeaking?: () => void;
    isSpeaking?: boolean;
}

export function ChatMessage({ message, onSpeak, onStopSpeaking, isSpeaking }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            onStopSpeaking?.();
        } else {
            onSpeak?.(message.content);
        }
    };

    // Format content with markdown-like styling and Maps button
    const formatContent = (content: string) => {
        // Check for Google Maps link
        const mapsMatch = content.match(/🗺️ Google Maps: (https:\/\/maps\.app\.goo\.gl\/\S+)/);
        const mapsUrl = mapsMatch ? mapsMatch[1] : null;

        // Remove maps URL from display text
        const displayContent = mapsUrl
            ? content.replace(/\n\n🗺️ Google Maps: https:\/\/maps\.app\.goo\.gl\/\S+/, '')
            : content;

        // Split by newlines and process
        const lines = displayContent.split('\n').map((line, index) => {
            // Bold text
            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            return (
                <span
                    key={index}
                    dangerouslySetInnerHTML={{ __html: formattedLine }}
                    className="block"
                />
            );
        });

        return (
            <>
                {lines}
                {mapsUrl && (
                    <button
                        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2
                                   bg-gradient-to-r from-primary-500/20 to-primary-600/20 
                                   border border-primary-500/30
                                   text-primary-400 text-sm font-medium rounded-lg
                                   hover:from-primary-500/30 hover:to-primary-600/30
                                   hover:border-primary-500/50
                                   transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Open in Google Maps
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                )}
            </>
        );
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isUser
                ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                : 'bg-gradient-to-br from-accent-purple to-accent-pink'
                }`}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Bubble */}
            <div className={`group relative max-w-[80%] ${isUser ? 'message-user' : 'message-assistant'}`}>
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {formatContent(message.content)}
                </div>

                {/* Action buttons for assistant messages */}
                {!isUser && (
                    <div className="absolute -bottom-8 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleSpeak}
                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        >
                            {isSpeaking ? (
                                <VolumeX className="w-4 h-4 text-slate-300" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-slate-300" />
                            )}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                            title="Copy message"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-slate-300" />
                            )}
                        </button>
                    </div>
                )}

                {/* Timestamp */}
                <div className={`text-xs mt-2 ${isUser ? 'text-blue-200/60' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

// Loading indicator component
export function TypingIndicator() {
    return (
        <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="message-assistant">
                <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}

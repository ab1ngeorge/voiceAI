import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { VoiceButton } from './VoiceButton';
import type { Message, Language } from '../types';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    language: Language;
    onSendMessage: (message: string) => void;
    onClearMessages: () => void;
    // Voice props
    isListening: boolean;
    isVoiceSupported: boolean;
    onToggleVoice: () => void;
    interimTranscript: string;
    transcript: string;
    onResetTranscript: () => void;
    // TTS props
    isSpeaking: boolean;
    onSpeak: (text: string) => void;
    onStopSpeaking: () => void;
}

export function ChatInterface({
    messages,
    isLoading,
    language,
    onSendMessage,
    onClearMessages,
    isListening,
    isVoiceSupported,
    onToggleVoice,
    interimTranscript,
    transcript,
    onResetTranscript,
    isSpeaking,
    onSpeak,
    onStopSpeaking,
}: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastMessageIdRef = useRef<string>('');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Auto-speak assistant responses
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Speak only new assistant messages
            if (lastMessage.role === 'assistant' && lastMessage.id !== lastMessageIdRef.current) {
                lastMessageIdRef.current = lastMessage.id;
                // Small delay to ensure UI updates first
                setTimeout(() => {
                    onSpeak(lastMessage.content);
                }, 300);
            }
        }
    }, [messages, onSpeak]);

    // Handle voice transcript
    useEffect(() => {
        if (transcript && !isListening) {
            // Send the transcript as a message
            onSendMessage(transcript);
            onResetTranscript();
        }
    }, [transcript, isListening, onSendMessage, onResetTranscript]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const getPlaceholder = () => {
        switch (language) {
            case 'ml':
                return 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...';
            case 'manglish':
                return 'Type your question here...';
            default:
                return 'Ask about admissions, fees, placements...';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
            {/* Messages Area - At Top */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {messages.length === 0 ? (
                    // Welcome Screen
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-accent-purple to-accent-pink flex items-center justify-center mb-6 shadow-2xl animate-bounce-slow">
                            <MessageCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
                            Welcome to LBS College Assistant!
                        </h2>
                        <p className="text-slate-400 max-w-md mb-6">
                            I'm here to help you with information about LBS College of Engineering, Kasaragod.
                            Just ask or tap a quick action below! 🎓
                        </p>

                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mb-6">
                            {[
                                { text: 'How to apply?', emoji: '📝' },
                                { text: 'Fee structure', emoji: '💰' },
                                { text: 'Placements', emoji: '💼' },
                                { text: 'Hostel info', emoji: '🏠' },
                                { text: 'Contact us', emoji: '📞' },
                                { text: 'Campus map', emoji: '🗺️' },
                            ].map((action) => (
                                <button
                                    key={action.text}
                                    onClick={() => onSendMessage(action.text)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 
                                        text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-purple/20 
                                        hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                                >
                                    <span className="text-lg">{action.emoji}</span>
                                    <span>{action.text}</span>
                                </button>
                            ))}
                        </div>

                        {/* Language Hint */}
                        <p className="text-xs text-slate-500">
                            🌐 Ask in English, Malayalam, or Manglish - I understand all!
                        </p>
                    </div>
                ) : (
                    // Messages List
                    <>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onSpeak={onSpeak}
                                onStopSpeaking={onStopSpeaking}
                                isSpeaking={isSpeaking}
                            />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Centered Mic Button - Middle Section */}
            <div className="flex flex-col items-center justify-center py-4 border-t border-slate-700/30">
                <VoiceButton
                    isListening={isListening}
                    isSupported={isVoiceSupported}
                    isLoading={isLoading}
                    onClick={onToggleVoice}
                    interimTranscript={interimTranscript}
                />

                {/* Interim transcript display */}
                {isListening && interimTranscript && (
                    <div className="mt-3 px-4 py-2 bg-slate-800/50 rounded-lg max-w-md">
                        <p className="text-sm text-slate-400 text-center">
                            <span className="text-primary-400">Hearing: </span>
                            "{interimTranscript}"
                        </p>
                    </div>
                )}
            </div>

            {/* Input Area - At Bottom */}
            <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-lg px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                        {/* Text Input */}
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={isListening ? interimTranscript || inputValue : inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isListening ? 'Listening...' : getPlaceholder()}
                                disabled={isLoading || isListening}
                                className="input-field pr-12 disabled:opacity-50"
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={(!inputValue.trim() && !transcript) || isLoading}
                            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 
                       text-white flex items-center justify-center transition-all duration-200
                       hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                       hover:scale-105 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>

                        {/* Clear Button */}
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={onClearMessages}
                                className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-700/50 text-slate-400 
                         flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 
                         transition-all duration-200"
                                title="Clear chat"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

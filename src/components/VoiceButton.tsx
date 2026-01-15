import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceButtonProps {
    isListening: boolean;
    isSupported: boolean;
    isLoading?: boolean;
    onClick: () => void;
    interimTranscript?: string;
}

export function VoiceButton({
    isListening,
    isSupported,
    isLoading,
    onClick,
    interimTranscript
}: VoiceButtonProps) {
    if (!isSupported) {
        return (
            <div className="flex flex-col items-center gap-2">
                <button
                    disabled
                    className="voice-btn opacity-50 cursor-not-allowed"
                    title="Voice input not supported in this browser"
                >
                    <MicOff className="w-8 h-8" />
                </button>
                <p className="text-sm text-slate-400">Voice not supported</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Main Button */}
            <button
                onClick={onClick}
                disabled={isLoading}
                className={`voice-btn ${isListening ? 'listening' : ''} ${isLoading ? 'opacity-70' : ''}`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
            >
                {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                    <div className="relative">
                        <Mic className="w-8 h-8" />
                        {/* Animated rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full rounded-full animate-ping bg-white/20 absolute"></div>
                        </div>
                    </div>
                ) : (
                    <Mic className="w-8 h-8" />
                )}
            </button>

            {/* Status Text */}
            <div className="text-center min-h-[3rem]">
                {isListening ? (
                    <div className="space-y-1">
                        <p className="text-sm text-primary-400 font-medium animate-pulse">
                            Listening...
                        </p>
                        {interimTranscript && (
                            <p className="text-sm text-slate-400 max-w-xs truncate">
                                "{interimTranscript}"
                            </p>
                        )}
                    </div>
                ) : isLoading ? (
                    <p className="text-sm text-slate-400">Processing...</p>
                ) : (
                    <p className="text-sm text-slate-500">
                        Tap to speak
                    </p>
                )}
            </div>
        </div>
    );
}

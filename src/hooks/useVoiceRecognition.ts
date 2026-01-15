import { useState, useCallback, useEffect, useRef } from 'react';
import type { Language } from '../types';

interface VoiceRecognitionState {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message?: string;
}

// Get language code for Web Speech API
// 'auto' mode uses 'en-IN' which can recognize English, Manglish, and some Malayalam
const getLanguageCode = (language: Language | 'auto'): string => {
    switch (language) {
        case 'ml':
            return 'ml-IN'; // Malayalam (pure script)
        case 'manglish':
        case 'auto':  // Auto-detect: en-IN works best for mixed language recognition
            return 'en-IN'; // English India - recognizes English, Manglish, and transliterated Malayalam
        case 'en':
        default:
            return 'en-US';
    }
};

export function useVoiceRecognition(language: Language | 'auto' = 'auto') {
    const [state, setState] = useState<VoiceRecognitionState>({
        isListening: false,
        isSupported: false,
        transcript: '',
        interimTranscript: '',
        error: null,
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check for browser support and setup recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setState(prev => ({ ...prev, isSupported: !!SpeechRecognition }));

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
            recognition.lang = getLanguageCode(language);

            recognition.onstart = () => {
                setState(prev => ({ ...prev, isListening: true, error: null }));
            };

            recognition.onend = () => {
                setState(prev => ({ ...prev, isListening: false }));
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                let errorMessage = 'Speech recognition error';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = "I didn't hear anything. Please try again!";
                        break;
                    case 'audio-capture':
                        errorMessage = 'No microphone found. Please check your microphone.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please allow microphone access.';
                        break;
                    case 'network':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = `Error: ${event.error}`;
                }
                setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setState(prev => ({
                    ...prev,
                    transcript: finalTranscript || prev.transcript,
                    interimTranscript,
                }));
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [language]); // Recreate recognition when language changes

    // Update language when it changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = getLanguageCode(language);
        }
    }, [language]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !state.isListening) {
            setState(prev => ({ ...prev, transcript: '', interimTranscript: '', error: null }));
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Speech recognition start error:', error);
            }
        }
    }, [state.isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && state.isListening) {
            recognitionRef.current.stop();
        }
    }, [state.isListening]);

    const toggleListening = useCallback(() => {
        if (state.isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [state.isListening, startListening, stopListening]);

    const resetTranscript = useCallback(() => {
        setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
    }, []);

    return {
        ...state,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript,
    };
}

// Extend Window interface for TypeScript - SpeechRecognition types
declare global {
    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;
        lang: string;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        start(): void;
        stop(): void;
        abort(): void;
    }

    interface SpeechRecognitionConstructor {
        new(): SpeechRecognition;
    }

    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

export { };

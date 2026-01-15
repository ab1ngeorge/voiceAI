import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '../types';

interface TTSState {
    isSpeaking: boolean;
    isSupported: boolean;
    error: string | null;
}

// Malayalam Unicode regex for content detection
const MALAYALAM_SCRIPT_REGEX = /[\u0D00-\u0D7F]/;

// Detect if text contains Malayalam script (content-based detection)
const containsMalayalamScript = (text: string): boolean => {
    return MALAYALAM_SCRIPT_REGEX.test(text);
};

// Language code mapping for Sarvam AI - now with content-based override
const getSarvamLanguageCode = (language: Language, textContent?: string): string => {
    // Content-based detection takes priority - if text contains Malayalam script, use ml-IN
    if (textContent && containsMalayalamScript(textContent)) {
        return 'ml-IN';
    }

    switch (language) {
        case 'ml':
            return 'ml-IN'; // Malayalam
        case 'manglish':
            return 'en-IN'; // Indian English
        case 'en':
        default:
            return 'en-IN'; // Indian English for natural accent
    }
};

// Get speaker based on language - use manisha for all Indian languages (per specification)
const getSpeaker = (_language: Language): string => {
    // Using manisha voice as specified for Malayalam/Indian English
    return 'manisha';
};

export function useTextToSpeech(language: Language = 'en') {
    const [state, setState] = useState<TTSState>({
        isSpeaking: false,
        isSupported: true, // Sarvam API is always available
        error: null,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const speak = useCallback(async (text: string) => {
        // Cancel any ongoing speech
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Clean up text for speech (remove markdown and emojis)
        const cleanText = text
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/[•📞📧🌐⏰💰🎓💻📡⚡⚙️🏗️🖥️🎯🏢💪🏠👦👧📋📝💼✉️📍🗺️🚗🏫📚🔬🍽️🏃📶🏧🏥👨‍💼🎉🔧🎭🏆🚀1️⃣2️⃣3️⃣4️⃣5️⃣]/g, '')
            .replace(/\n+/g, '. ') // Replace newlines with pauses
            .trim();

        if (!cleanText) return;

        setState(prev => ({ ...prev, isSpeaking: true, error: null }));

        try {
            const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

            if (!apiKey) {
                throw new Error('Sarvam API key not configured');
            }

            const response = await fetch('https://api.sarvam.ai/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': apiKey,
                },
                body: JSON.stringify({
                    inputs: [cleanText],
                    target_language_code: getSarvamLanguageCode(language, cleanText),
                    speaker: getSpeaker(language),
                    model: 'bulbul:v2',
                    pitch: 0,
                    pace: 1.0,
                    loudness: 1.2,
                    enable_preprocessing: true,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            // Sarvam returns base64 encoded audio
            if (data.audios && data.audios[0]) {
                const audioBase64 = data.audios[0];
                const audioBlob = base64ToBlob(audioBase64, 'audio/wav');
                const audioUrl = URL.createObjectURL(audioBlob);

                audioRef.current = new Audio(audioUrl);

                audioRef.current.onended = () => {
                    setState(prev => ({ ...prev, isSpeaking: false }));
                    URL.revokeObjectURL(audioUrl);
                };

                audioRef.current.onerror = () => {
                    setState(prev => ({
                        ...prev,
                        isSpeaking: false,
                        error: 'Failed to play audio'
                    }));
                    URL.revokeObjectURL(audioUrl);
                };

                await audioRef.current.play();
            } else {
                throw new Error('No audio data received');
            }
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                // Ignore abort errors
                return;
            }

            console.error('Sarvam TTS error:', error);

            // Fallback to browser TTS if Sarvam fails
            fallbackToBrowserTTS(cleanText, language);

            setState(prev => ({
                ...prev,
                isSpeaking: true, // Still speaking via fallback
                error: null
            }));
        }
    }, [language]);

    // Fallback to browser's built-in TTS
    const fallbackToBrowserTTS = (text: string, lang: Language) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';
            utterance.rate = 0.95;

            utterance.onend = () => {
                setState(prev => ({ ...prev, isSpeaking: false }));
            };

            window.speechSynthesis.speak(utterance);
        } else {
            setState(prev => ({ ...prev, isSpeaking: false }));
        }
    };

    const stop = useCallback(() => {
        // Stop Sarvam audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Abort any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Also stop browser TTS if running
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setState(prev => ({ ...prev, isSpeaking: false }));
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    }, []);

    return {
        ...state,
        speak,
        stop,
        pause,
        resume,
    };
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

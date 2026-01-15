import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Language, ChatState } from '../types';
import { searchKnowledgeBase } from '../lib/knowledgeBase';
import { detectLanguage, getResponseLanguage } from '../lib/languageDetection';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const STORAGE_KEY = 'lbs-chat-history';

// System prompt for natural, human-like responses
const SYSTEM_PROMPT = `You are a friendly AI assistant for LBS College of Engineering, Kasaragod, Kerala.

PERSONALITY: Warm, helpful, conversational - like a friendly senior student.

CRITICAL RULES:
1. ONLY use information provided in the CONTEXT below. Never invent facts.
2. Keep responses SHORT (1-3 sentences) - optimized for voice.
3. Answer ONLY what was asked. Don't dump all related info.
4. Use natural speech - no bullet points, no key:value format.
5. If info not in context, say "I don't have that info. Contact office at 04994-250790."

LANGUAGE MATCHING (MUST FOLLOW):
- If user speaks Malayalam script → Reply in Malayalam
- If user speaks Manglish → Reply in Manglish  
- If user speaks English → Reply in English

INTERACTIVE: If query is vague, ask clarifying question first.
Example: "hostel?" → "We have boys and girls hostels. Which one would you like to know about?"

HUMAN TOUCH: Start with natural openers like "Sure!", "Oh that's a great question!", "Actually..."`;

// Load saved messages from localStorage
function loadSavedMessages(): Message[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            return parsed.map((msg: Message) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
    }
    return [];
}

// Save messages to localStorage
function saveMessages(messages: Message[]): void {
    try {
        // Only keep last 50 messages to prevent storage bloat
        const toSave = messages.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

const initialState: ChatState = {
    messages: [],
    isLoading: false,
    error: null,
    language: 'en',
};

// Call Gemini API for human-like response
async function callGeminiAPI(userMessage: string, context: string, language: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, using local response');
        return '';
    }

    try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: userMessage }]
                }],
                systemInstruction: {
                    parts: [{ text: `${SYSTEM_PROMPT}\n\nUser language: ${language}\n\nCONTEXT:\n${context}` }]
                },
                generationConfig: {
                    temperature: 0.6,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 300,
                },
            }),
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            return '';
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('Gemini API call failed:', error);
        return '';
    }
}

export function useChat() {
    const [state, setState] = useState<ChatState>(() => ({
        ...initialState,
        messages: loadSavedMessages(),
    }));

    // Save messages whenever they change
    useEffect(() => {
        if (state.messages.length > 0) {
            saveMessages(state.messages);
        }
    }, [state.messages]);

    const setLanguage = useCallback((language: Language) => {
        setState(prev => ({ ...prev, language }));
    }, []);

    const addMessage = useCallback((role: 'user' | 'assistant', content: string, detectedLang?: Language): Message => {
        const message: Message = {
            id: uuidv4(),
            role,
            content,
            timestamp: new Date(),
            language: detectedLang || state.language,
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, message],
        }));

        return message;
    }, [state.language]);

    const sendMessage = useCallback(async (content: string): Promise<string> => {
        if (!content.trim()) return '';

        // Auto-detect language from user input
        const detectedLang = detectLanguage(content);
        const responseLang = getResponseLanguage(detectedLang);

        // Update the current language based on detection
        if (detectedLang !== state.language) {
            setState(prev => ({ ...prev, language: detectedLang }));
        }

        // Add user message with detected language
        addMessage('user', content, detectedLang);

        // Set loading state
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get context from local knowledge base
            const localResult = searchKnowledgeBase(content, responseLang);

            // Try to get AI-generated human response using Gemini
            let aiResponse = await callGeminiAPI(
                content,
                localResult.content,
                detectedLang
            );

            // Fall back to local result if AI fails
            const finalResponse = aiResponse.trim() || localResult.content;

            // Add assistant response
            addMessage('assistant', finalResponse);

            setState(prev => ({ ...prev, isLoading: false }));

            return finalResponse;
        } catch (error) {
            const errorMessage = "Oops! Something went wrong. Please try again, or contact our office at 04994-250790.";
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));
            addMessage('assistant', errorMessage);
            return errorMessage;
        }
    }, [addMessage, state.language]);

    const clearMessages = useCallback(() => {
        setState(prev => ({ ...prev, messages: [], error: null }));
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const removeMessage = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            messages: prev.messages.filter(m => m.id !== id),
        }));
    }, []);

    return {
        messages: state.messages,
        isLoading: state.isLoading,
        error: state.error,
        language: state.language,
        setLanguage,
        sendMessage,
        addMessage,
        clearMessages,
        removeMessage,
    };
}


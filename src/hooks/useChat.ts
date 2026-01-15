import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Language, ChatState } from '../types';
import { searchKnowledgeBase } from '../lib/knowledgeBase';
import { detectLanguage, getResponseLanguage } from '../lib/languageDetection';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const STORAGE_KEY = 'lbs-chat-history';

// System prompt for natural, human-like responses - STRICT DATABASE USAGE
const SYSTEM_PROMPT = `You are the voice assistant for LBS College of Engineering, Kasaragod, Kerala.

🚨 CRITICAL RULE - NO HALLUCINATION:
You will receive CONTEXT containing facts from our database. 
ONLY use information from CONTEXT to answer. 
If the answer is NOT in CONTEXT, say "I don't have that specific information. Please contact our office at 04994-250790."
NEVER invent or guess information.

📋 HOW TO RESPOND:
1. Read the CONTEXT carefully - this is your ONLY source of truth
2. Rephrase the information naturally (don't copy word-for-word)
3. Be friendly and conversational
4. Keep it SHORT - 1-3 sentences for voice
5. Match the user's language (English/Malayalam/Manglish)

✅ EXAMPLE:
CONTEXT: "Principal: Dr. Mohammad Shekoor T, Phone: 04994-250290"
User: "Who is the principal?"
Response: "Our principal is Dr. Mohammad Shekoor T. You can reach his office at 04994-250290."

❌ NEVER DO:
- Don't add facts not in CONTEXT
- Don't mention other colleges
- Don't guess numbers, names, or dates
- Don't say "I think" or "probably"

🗣️ TONE: Friendly senior student helping a junior. Be warm but accurate.`;


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
    language: 'manglish', // Default to Manglish for voice input
};

// Call Gemini API for human-like response
async function callGeminiAPI(userMessage: string, context: string, language: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, using local response');
        return '';
    }

    // Map language code to detailed instruction with examples
    let languageInstruction = '';
    let languageContext = '';

    if (language === 'ml') {
        languageContext = '[മലയാളത്തിൽ മറുപടി - MALAYALAM SCRIPT ONLY]\n';
        languageInstruction = `CRITICAL: RESPOND IN MALAYALAM SCRIPT (മലയാളം) ONLY.
DO NOT use English letters or Manglish.
DO NOT use English words like "Principal", "College". Use Malayalam equivalents (e.g. പ്രിൻസിപ്പാൾ, കോളേജ്).

The CONTEXT is in English. YOU MUST TRANSLATE IT TO MALAYALAM.

Example:
CONTEXT: "Principal: Dr. Mohammad Shekoor T"
Response: "ഞങ്ങളുടെ പ്രിൻസിപ്പൽ ഡോ. മുഹമ്മദ് ഷെക്കൂർ ടി ആണ്."

Common terms:
- College -> കോളേജ്
- Hostel -> ഹോസ്റ്റൽ
- Fees -> ഫീസ്
- Placement -> പ്ലേസ്മെന്റ്
- Library -> ലൈബ്രറി`;
    } else if (language === 'manglish') {
        languageContext = '[Manglish response]\n';
        languageInstruction = `RESPOND IN MANGLISH (Malayalam in English letters)

Use ONLY facts from CONTEXT. Convert to natural Manglish.

Example:
CONTEXT: "Principal: Dr. Mohammad Shekoor T"
Response: "Namude principal Dr. Mohammad Shekoor T aanu."

Use words: "Athe", "Undu", "Illa", "Nalla"
Starters: "Athe!", "Pinne!", "Nalla chodyam!"`;
    } else {
        languageContext = '[English response]\n';
        languageInstruction = `RESPOND IN CONVERSATIONAL ENGLISH

Use ONLY facts from CONTEXT. Be friendly and natural.

Example:
CONTEXT: "Principal: Dr. Mohammad Shekoor T"
Response: "Our principal is Dr. Mohammad Shekoor T."`;
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
                    parts: [{ text: `${SYSTEM_PROMPT}\n\n⚠️ LANGUAGE INSTRUCTION: ${languageInstruction}\n\n📚 CONTEXT (use this info to answer - TRANSLATE if needed):\n${languageContext}${context}` }]
                },
                generationConfig: {
                    temperature: 0.3, // Low temperature for factual accuracy
                    topP: 0.8,
                    topK: 30,
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


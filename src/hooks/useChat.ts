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

PERSONALITY: Warm, helpful, and conversational - speak like a friendly senior student chatting with a junior. Be natural, approachable, and genuinely helpful.

HOW TO RESPOND (VERY IMPORTANT):
1. Read the CONTEXT provided - it contains facts from our database.
2. UNDERSTAND the facts, then REPHRASE them in your own natural words.
3. DO NOT copy-paste or quote the context directly. Transform it into casual conversation.
4. Speak like you're having a friendly chat - use natural expressions.
5. Keep it SHORT (1-3 sentences) - this is for voice, not reading.

EXAMPLE OF GOOD vs BAD:
- Context says: "Fees: Government quota - Rs. 40,000 per year"
- BAD: "Government quota fees is Rs. 40,000 per year."
- GOOD (English): "For government quota, you'll be paying around 40 thousand per year - that's pretty reasonable!"
- GOOD (Malayalam): "ഗവൺമെന്റ് ക്വാട്ടയ്ക്ക് ഒരു വർഷം 40,000 രൂപ ആണ്. അത്ര ചെലവേയില്ല!"
- GOOD (Manglish): "Government quota aanel 40,000 per year aanu - athu reasonable aanu!"

STRICT RULES:
1. ONLY use facts from CONTEXT. Never make up information.
2. If the answer isn't in context, say you don't have that info.
3. Answer ONLY what was asked - don't dump everything.

LANGUAGE MATCHING (CRITICAL - MANDATORY):
Match the user's language EXACTLY. This is non-negotiable.

If user asks in MALAYALAM SCRIPT (മലയാളം):
→ Reply ONLY in Malayalam script
→ Use phrases like: "അതെ, ...", "തീർച്ചയായും ...", "നല്ല ചോദ്യം!", "പിന്നെ എന്തെങ്കിലും?"
→ Example: "ഹോസ്റ്റൽ ഉണ്ടോ?" → "അതെ, ബോയ്സിനും ഗേൾസിനും സെപ്പറേറ്റ് ഹോസ്റ്റൽ ഉണ്ട്!"

If user asks in MANGLISH (romanized Malayalam):
→ Reply in natural Manglish
→ Use phrases like: "Athe, ...", "Pinne, ...", "Sheriyanu!", "Koode enthenkilum ariyano?"
→ Example: "hostel undo?" → "Athe, boys num girls num separate hostels undu. Nalla facilities aanu!"

If user asks in ENGLISH:
→ Reply in conversational English
→ Use: "Actually...", "So basically...", "That's a great question!", "Anything else?"
→ Example: "Is there hostel?" → "Yes! We have separate hostels for boys and girls with good facilities."

CONVERSATIONAL PHRASES TO USE:
English: "Actually...", "So basically...", "You know what...", "That's a great question!", "Want to know more?"
Manglish: "Athe...", "Pinne...", "Sherikkum...", "Nalla chodyam!", "Koode enthenkilum?"
Malayalam: "അതെ...", "പിന്നെ...", "ശരിക്കും...", "നല്ല ചോദ്യം!", "കൂടെ എന്തെങ്കിലും?"

Be warm, genuine, and helpful - like a real person, not a robot!`;

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

    if (language === 'ml') {
        languageInstruction = `🚨 CRITICAL: RESPOND ONLY IN MALAYALAM SCRIPT (മലയാളം)
        
DO NOT use English. DO NOT use Manglish. ONLY Malayalam script like: അതെ, ഞങ്ങൾ, ഉണ്ട്, ഹോസ്റ്റൽ

Example response format:
"അതെ, ഞങ്ങളുടെ കോളേജിൽ ഹോസ്റ്റൽ സൗകര്യം ഉണ്ട്. ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കും പ്രത്യേകം ഹോസ്റ്റലുകൾ ഉണ്ട്."

Use conversational Malayalam phrases: "അതെ...", "തീർച്ചയായും...", "നല്ല ചോദ്യം!", "പിന്നെ എന്തെങ്കിലും അറിയണോ?"`;
    } else if (language === 'manglish') {
        languageInstruction = `🚨 CRITICAL: RESPOND IN MANGLISH (Malayalam written in English letters)

DO NOT use Malayalam script. DO NOT use pure English. Use Manglish like: "Athe", "undu", "illa", "nalla", "collegil"

Example response format:
"Athe, namude college il hostel facility undu. Boys num girls num separate hostels aanu. Nalla facilities okke undu!"

Use Manglish phrases: "Athe...", "Pinne...", "Sherikkum...", "Nalla chodyam!", "Koode enthenkilum ariyano?"`;
    } else {
        languageInstruction = `RESPOND IN CONVERSATIONAL ENGLISH
        
Use natural, friendly English like a helpful senior student. Be warm and approachable.
Example: "Yes! We do have hostel facilities here. There are separate hostels for boys and girls with good amenities."`;
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
                    parts: [{ text: `${SYSTEM_PROMPT}\n\n⚠️ IMPORTANT: ${languageInstruction}\n\nCONTEXT:\n${context}` }]
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


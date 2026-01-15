import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Language, ChatState } from '../types';
import { searchKnowledgeBase } from '../lib/knowledgeBase';
import { detectLanguage, getResponseLanguage } from '../lib/languageDetection';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const STORAGE_KEY = 'lbs-chat-history';

// System prompt for natural, human-like responses
const SYSTEM_PROMPT = `You are LBSCEK Assistant - a super friendly, enthusiastic voice assistant for LBS College of Engineering, Kasaragod, Kerala.

🎭 YOUR PERSONALITY:
- You're like a HELPFUL SENIOR STUDENT who LOVES their college
- Be WARM, ENTHUSIASTIC, and genuinely EXCITED to help
- Show EMOTION - be happy when sharing good news, empathetic when needed
- Sound like a REAL HUMAN having a casual chat, NOT a robot reading data
- Be ENCOURAGING and POSITIVE about the college

🗣️ VOICE-FRIENDLY RESPONSES:
- Keep it SHORT (1-3 sentences max) - this is SPOKEN, not read!
- Use natural PAUSES and RHYTHM in your speech
- Start with a reaction word before giving info
- End with a friendly follow-up when appropriate

📝 HOW TO RESPOND:
1. Read the CONTEXT - it has facts from our database
2. REACT first (wow, oh, nice question!)
3. Then REPHRASE the facts naturally in your own words
4. NEVER copy-paste database text directly
5. Sound like you're TALKING, not reciting

✅ GOOD vs ❌ BAD EXAMPLES:
Context: "Hostel capacity: Boys 300, Girls 200"
❌ BAD: "The boys hostel has 300 capacity and girls hostel has 200 capacity."
✅ GOOD (English): "Oh yes! We've got hostels for both boys and girls - pretty spacious actually, around 300 and 200 capacity. The facilities are quite nice too!"
✅ GOOD (Malayalam): "അതെ! ഹോസ്റ്റൽ ഉണ്ട്. ബോയ്സിന് 300 ഉം ഗേൾസിന് 200 ഉം കപാസിറ്റി ഉണ്ട്. സൗകര്യങ്ങൾ നല്ലതാണ്!"
✅ GOOD (Manglish): "Athe! Hostel undu - boys nu 300, girls nu 200 capacity und. Facilities okke nalla aanallo!"

⚠️ STRICT RULES:
1. ONLY use facts from CONTEXT - never make up info
2. If info not in context, say: "Hmm, I don't have that exact info, but you can check with the office!"
3. Answer ONLY what's asked - don't info dump

🌐 LANGUAGE MATCHING (CRITICAL):
ALWAYS match the user's language EXACTLY!

📍 MALAYALAM SCRIPT (മലയാളം):
- Reply ONLY in Malayalam script
- Starters: "അതെ!", "ഓ!", "നല്ല ചോദ്യം!", "തീർച്ചയായും!"
- Enders: "കൂടെ എന്തെങ്കിലും അറിയണോ?", "സഹായിക്കാൻ സന്തോഷം!"
- Express emotion: "വളരെ നല്ലത്!", "സൂപ്പർ!", "ഗ്രേറ്റ്!"

📍 MANGLISH (romanized Malayalam):
- Reply in natural Manglish
- Starters: "Athe!", "Oh!", "Nalla chodyam!", "Pinne!"
- Enders: "Vere enthenkilum ariyano?", "Happy to help!"
- Express emotion: "Super aanu!", "Adipoli!", "Kidu!"

📍 ENGLISH:
- Reply in friendly conversational English
- Starters: "Oh yes!", "Actually...", "Great question!", "So basically..."
- Enders: "Anything else?", "Happy to help more!", "Let me know!"
- Express emotion: "That's awesome!", "Pretty cool right?", "Nice!"

🎉 BE ENTHUSIASTIC ABOUT:
- College facilities, placements, clubs, events
- Student life and opportunities
- Faculty and departments

💬 SAMPLE RESPONSES BY MOOD:
- Excited: "Oh wow, you're asking about placements? We've got some great news there!"
- Helpful: "Sure thing! Let me tell you about that..."
- Empathetic: "I understand you need this info - let me help!"
- Proud: "Actually, our college has some really good facilities for that!"

Remember: You're not just giving info, you're having a FRIENDLY CONVERSATION! 🎯`;


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
                    parts: [{ text: `${SYSTEM_PROMPT}\n\n⚠️ LANGUAGE INSTRUCTION: ${languageInstruction}\n\n📚 CONTEXT (use this info to answer):\n${context}` }]
                },
                generationConfig: {
                    temperature: 0.75, // Higher for more natural, varied responses
                    topP: 0.85,
                    topK: 40,
                    maxOutputTokens: 350, // Slightly more for complete thoughts
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


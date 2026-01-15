// Supabase Edge Function: college-chat
// Main AI function using Google Gemini 2.0 Flash

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// System prompt for LBS College Assistant - Optimized for natural, human-like responses
const SYSTEM_PROMPT = `You are the official AI assistant for LBS College of Engineering, Kasaragod, Kerala, India.

IDENTITY:
- Name: LBS College Assistant
- Languages: Malayalam (മലയാളം), Manglish (romanized Malayalam), English
- Personality: Warm, friendly, conversational, like a helpful senior student or staff member

CORE PRINCIPLE - NATURAL HUMAN COMMUNICATION:
You must NEVER sound like a robot reading from a database. Instead:
- Understand what the user is really asking
- Use the provided database/context as your SOURCE OF TRUTH
- REPHRASE and EXPLAIN the information naturally, like a friend would
- Imagine you're speaking to a prospective student or parent in person

INTERACTIVE CLARIFICATION (VERY IMPORTANT):
When a user asks an AMBIGUOUS question, ASK a clarifying question FIRST before answering.

Examples of when to ask clarifying questions:
1. "Tell me about hostel" → Ask: "We have separate hostels for boys and girls. Which one would you like to know about - the boys hostel or the ladies hostel?"
2. "Who is the HOD?" → Ask: "We have HODs for each department. Which department are you interested in - CSE, ECE, EEE, Mechanical, Civil, or IT?"
3. "What is the fee?" → Ask: "Fees depend on the quota. Are you asking about government quota, management quota, or NRI quota fees?"
4. "Tell me about placements" → Ask: "I'd be happy to help! Are you looking for placement statistics, top recruiters, average packages, or the placement process?"
5. "How to get admission?" → Ask: "Are you asking about B.Tech admission through KEAM, or M.Tech/MCA admission?"

DO NOT dump all information at once. Have a CONVERSATION:
- Ask ONE clarifying question at a time
- Wait for user response
- Then provide specific, relevant information
- This makes the interaction feel like talking to a real person!

ANSWER PRECISION (VERY IMPORTANT):
Answer ONLY what the user specifically asked. Do NOT dump all related information.

Examples:
- "Principal name?" → "Our Principal is Dr. Mohammad Shekoor T." (NOT all his details)
- "College phone number?" → "You can reach us at 04994-250790." (NOT email, address, etc.)
- "Where is library?" → "The library is in the Academic Block, ground floor." (NOT timing, books count, etc.)
- "CSE seats?" → "CSE has 120 seats." (NOT all branches)

If user wants more details, they will ask. Keep answers SHORT and PRECISE like a human would.

RESPONSE STYLE GUIDELINES:
1. Be BRIEF - one or two sentences max for simple questions
2. NEVER use key-value format like "Name: Dr. X, Email: x@y.com"
   Instead say naturally: "Our Principal is Dr. Mohammad Shekoor T."
3. Add a short follow-up ONLY if relevant: "Would you like his contact details?"

4. Keep it CONVERSATIONAL - optimized for voice/speech

LANGUAGE MATCHING (CRITICAL - MUST FOLLOW):
You MUST ALWAYS respond in the SAME LANGUAGE the user asked in. This is non-negotiable.

1. If user asks in MALAYALAM (മലയാളം script) → Respond ONLY in Malayalam
   Example: "ഹോസ്റ്റൽ ഉണ്ടോ?" → "അതെ, ഞങ്ങൾക്ക് ഹോസ്റ്റൽ സൗകര്യം ഉണ്ട്! ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കും വെവ്വേറെ ഹോസ്റ്റലുകൾ ആണ്. ഏതിനെ കുറിച്ചാണ് അറിയേണ്ടത്?"

2. If user asks in MANGLISH (romanized Malayalam) → Respond in Manglish  
   Example: "hostel undo?" → "Athe, namukku hostel undu! Boys num girls num separate hostels aanu. Ethine kurichu ariyendath?"

3. If user asks in ENGLISH → Respond in English
   Example: "Is there hostel?" → "Yes, we do have hostel facilities! We have separate hostels for boys and girls. Which one would you like to know about?"

HUMAN-LIKE BEHAVIOR:
- Talk like a friendly senior student or helpful staff member
- Use natural expressions: "Oh!", "Actually...", "You know what...", "Well..."
- Show enthusiasm and warmth in your responses
- Be empathetic and understanding
- Use casual, friendly tone - not formal or robotic
- React naturally to questions: "That's a great question!", "Sure thing!", "Happy to help!"

ACCURACY RULES (CRITICAL):
- ONLY use facts from the provided context/database
- If information is not in context, say: "I'm not sure about that specific detail. Let me suggest you contact the office directly for accurate information."
- Never invent names, numbers, or dates
- When in doubt, be honest rather than make things up

RESPONSE FORMAT FOR VOICE:
- NO bullet points or lists - speak naturally
- NO special characters or symbols
- Use flowing sentences that are easy to speak aloud
- Vary your sentence structure for natural rhythm

COLLEGE FACTS (as reference):
- Full Name: LBS College of Engineering, Kasaragod
- Abbreviation: LBSCEK
- Location: Kasaragod, Kerala, India
- Type: Government-aided engineering college
- Affiliation: APJ Abdul Kalam Technological University (KTU)
- Established: 1993`;

// Direct answers database for anti-hallucination
const DIRECT_ANSWERS = [
    {
        patterns: [/principal/i, /പ്രിൻസിപ്പൽ/, /head of institution/i, /college head/i],
        answer: {
            en: "The Principal of LBS College of Engineering is Dr. Suresh Kumar N. You can reach the Principal's office at 04994-256400.",
            ml: "LBS കോളേജ് ഓഫ് എഞ്ചിനീയറിംഗിന്റെ പ്രിൻസിപ്പൽ ഡോ. സുരേഷ് കുമാർ എൻ ആണ്. പ്രിൻസിപ്പലിന്റെ ഓഫീസിലേക്ക് 04994-256400 എന്ന നമ്പറിൽ വിളിക്കാം.",
            manglish: "LBS College of Engineeringinte Principal Dr. Suresh Kumar N aanu. Principal office number 04994-256400 aanu.",
        },
    },
    {
        patterns: [/cse\s*hod/i, /computer\s*science\s*hod/i, /cs\s*department\s*head/i],
        answer: {
            en: "The HOD of Computer Science and Engineering department is Dr. Manoj Kumar G.",
            ml: "കമ്പ്യൂട്ടർ സയൻസ് ആൻഡ് എഞ്ചിനീയറിംഗ് വിഭാഗം മേധാവി ഡോ. മനോജ് കുമാർ ജി ആണ്.",
            manglish: "Computer Science and Engineering departmentinte HOD Dr. Manoj Kumar G aanu.",
        },
    },
    {
        patterns: [/ece\s*hod/i, /electronics\s*(and)?\s*communication\s*hod/i, /ec\s*department\s*head/i],
        answer: {
            en: "The HOD of Electronics and Communication Engineering department is Dr. Rajan P.",
            ml: "ഇലക്ട്രോണിക്സ് ആൻഡ് കമ്മ്യൂണിക്കേഷൻ എഞ്ചിനീയറിംഗ് വിഭാഗം മേധാവി ഡോ. രാജൻ പി ആണ്.",
            manglish: "Electronics and Communication Engineering departmentinte HOD Dr. Rajan P aanu.",
        },
    },
    {
        patterns: [/eee\s*hod/i, /electrical\s*(and)?\s*electronics\s*hod/i, /ee\s*department\s*head/i],
        answer: {
            en: "The HOD of Electrical and Electronics Engineering department is Dr. Sudheer K.",
            ml: "ഇലക്ട്രിക്കൽ ആൻഡ് ഇലക്ട്രോണിക്സ് എഞ്ചിനീയറിംഗ് വിഭാഗം മേധാവി ഡോ. സുധീർ കെ ആണ്.",
            manglish: "Electrical and Electronics Engineering departmentinte HOD Dr. Sudheer K aanu.",
        },
    },
    {
        patterns: [/mech(anical)?\s*hod/i, /mechanical\s*engineering\s*hod/i, /me\s*department\s*head/i],
        answer: {
            en: "The HOD of Mechanical Engineering department is Dr. Jayakrishnan R.",
            ml: "മെക്കാനിക്കൽ എഞ്ചിനീയറിംഗ് വിഭാഗം മേധാവി ഡോ. ജയകൃഷ്ണൻ ആർ ആണ്.",
            manglish: "Mechanical Engineering departmentinte HOD Dr. Jayakrishnan R aanu.",
        },
    },
    {
        patterns: [/civil\s*hod/i, /civil\s*engineering\s*hod/i, /ce\s*department\s*head/i],
        answer: {
            en: "The HOD of Civil Engineering department is Dr. Priya Mathew.",
            ml: "സിവിൽ എഞ്ചിനീയറിംഗ് വിഭാഗം മേധാവി ഡോ. പ്രിയ മാത്യു ആണ്.",
            manglish: "Civil Engineering departmentinte HOD Dr. Priya Mathew aanu.",
        },
    },
    {
        patterns: [/college\s*(phone|contact|number)/i, /phone\s*number/i, /contact\s*number/i],
        answer: {
            en: "You can contact LBS College of Engineering at 04994-256400 (Office) or email at lbscek@gmail.com",
            ml: "LBS കോളേജ് ഓഫ് എഞ്ചിനീയറിംഗിലേക്ക് 04994-256400 (ഓഫീസ്) എന്ന നമ്പറിൽ വിളിക്കാം. ഇമെയിൽ: lbscek@gmail.com",
            manglish: "LBS College of Engineeringinte contact number 04994-256400 (Office) aanu. Email: lbscek@gmail.com",
        },
    },
];

// Language detection function
function detectLanguage(message: string): 'ml' | 'en' | 'manglish' {
    const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(message);
    if (hasMalayalamScript) return 'ml';

    const manglishPatterns = [
        /\b(enthu|enth|entha|enthanu)\b/i,
        /\b(evide|evidey|evidanu)\b/i,
        /\b(aaru|aaranu|aar)\b/i,
        /\b(eppo|eppol|eppozhanu)\b/i,
        /\b(engane|enganeya)\b/i,
        /\b(aanu|aan|anu|alla|alle)\b/i,
        /\b(und|undu|undoo|undo|illa)\b/i,
        /\b(njan|njaan|naan)\b/i,
        /\b(collegil|hostelil|libraryil)\b/i,
    ];

    const manglishScore = manglishPatterns.reduce((score, pattern) => {
        return score + (pattern.test(message) ? 1 : 0);
    }, 0);

    if (manglishScore >= 2 || (manglishScore === 1 && message.split(' ').length <= 5)) {
        return 'manglish';
    }

    return 'en';
}

// Check for direct answers
function checkDirectAnswers(message: string, language: 'ml' | 'en' | 'manglish'): string | null {
    for (const item of DIRECT_ANSWERS) {
        for (const pattern of item.patterns) {
            if (pattern.test(message)) {
                return item.answer[language] || item.answer.en;
            }
        }
    }
    return null;
}

// Website URL mapping for different topics
const WEBSITE_URL_MAP: Record<string, string> = {
    'admission': 'https://lbscek.ac.in/admissions/',
    'courses': 'https://lbscek.ac.in/academics/',
    'departments': 'https://lbscek.ac.in/departments/',
    'cse': 'https://lbscek.ac.in/departments/cse/',
    'ece': 'https://lbscek.ac.in/departments/ece/',
    'eee': 'https://lbscek.ac.in/departments/eee/',
    'mechanical': 'https://lbscek.ac.in/departments/me/',
    'civil': 'https://lbscek.ac.in/departments/ce/',
    'placement': 'https://lbscek.ac.in/placements/',
    'faculty': 'https://lbscek.ac.in/faculty/',
    'about': 'https://lbscek.ac.in/about/',
    'contact': 'https://lbscek.ac.in/contact/',
    'hostel': 'https://lbscek.ac.in/facilities/',
    'facilities': 'https://lbscek.ac.in/facilities/',
    'default': 'https://lbscek.ac.in/'
};

// Get relevant website URL based on query keywords
function getWebsiteURL(message: string): string {
    const msgLower = message.toLowerCase();

    if (/admission|apply|keam|entrance/.test(msgLower)) return WEBSITE_URL_MAP.admission;
    if (/course|program|branch|degree/.test(msgLower)) return WEBSITE_URL_MAP.courses;
    if (/cse|computer\s*science/.test(msgLower)) return WEBSITE_URL_MAP.cse;
    if (/ece|electronics\s*communication/.test(msgLower)) return WEBSITE_URL_MAP.ece;
    if (/eee|electrical/.test(msgLower)) return WEBSITE_URL_MAP.eee;
    if (/mechanical|me\s*department/.test(msgLower)) return WEBSITE_URL_MAP.mechanical;
    if (/civil|ce\s*department/.test(msgLower)) return WEBSITE_URL_MAP.civil;
    if (/placement|job|recruit|company/.test(msgLower)) return WEBSITE_URL_MAP.placement;
    if (/faculty|teacher|professor|staff/.test(msgLower)) return WEBSITE_URL_MAP.faculty;
    if (/hostel|accommodation|stay/.test(msgLower)) return WEBSITE_URL_MAP.hostel;
    if (/facility|facilities|lab|library|canteen/.test(msgLower)) return WEBSITE_URL_MAP.facilities;
    if (/contact|phone|email|address/.test(msgLower)) return WEBSITE_URL_MAP.contact;
    if (/about|history|college/.test(msgLower)) return WEBSITE_URL_MAP.about;

    return WEBSITE_URL_MAP.default;
}

// Fetch content from college website
async function fetchWebsiteContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LBSCollegeBot/1.0)',
            },
        });

        if (!response.ok) {
            console.error(`Website fetch failed: ${response.status}`);
            return '';
        }

        const html = await response.text();

        // Extract text content from HTML (basic extraction)
        // Remove script and style tags first
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

        // Extract text from remaining HTML
        text = text
            .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .trim();

        // Limit content length for API context
        return text.substring(0, 3000);
    } catch (error) {
        console.error('Website fetch error:', error);
        return '';
    }
}

// Call Gemini API
async function callGeminiAPI(userMessage: string, context: string): Promise<string> {
    if (!GOOGLE_AI_API_KEY) {
        throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                role: "user",
                parts: [{ text: userMessage }]
            }],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT + "\n\nCONTEXT:\n" + context }]
            },
            generationConfig: {
                temperature: 0.5,
                topP: 0.7,
                topK: 40,
                maxOutputTokens: 600,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ]
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { message, conversationHistory } = await req.json();

        if (!message) {
            throw new Error("Message is required");
        }

        // Detect language
        const detectedLanguage = detectLanguage(message);

        // Check for direct answers first (anti-hallucination)
        const directAnswer = checkDirectAnswers(message, detectedLanguage);
        if (directAnswer) {
            return new Response(JSON.stringify({
                response: directAnswer,
                language: detectedLanguage,
                source: 'direct',
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Build context from conversation history
        let context = "";
        if (conversationHistory && conversationHistory.length > 0) {
            context = conversationHistory.map((msg: { role: string; content: string }) =>
                `${msg.role}: ${msg.content}`
            ).join("\n");
        }

        // Fetch relevant website content as additional context
        const websiteURL = getWebsiteURL(message);
        const websiteContent = await fetchWebsiteContent(websiteURL);

        if (websiteContent) {
            context += `\n\nWEBSITE CONTENT FROM ${websiteURL}:\n${websiteContent}`;
        }

        // Call Gemini API with website context
        const aiResponse = await callGeminiAPI(message, context);

        return new Response(JSON.stringify({
            response: aiResponse,
            language: detectedLanguage,
            source: websiteContent ? 'ai_with_website' : 'ai',
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({
            error: "Sorry, I encountered an error. Please try again.",
            language: 'en',
        }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});

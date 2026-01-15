/**
 * Language Detection Utility
 * Auto-detects if user input is in English, Malayalam, or Manglish (Malayalam written in English letters)
 */

export type DetectedLanguage = 'en' | 'ml' | 'manglish';

// Malayalam Unicode range: \u0D00-\u0D7F
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;

// Common Manglish patterns and words (Malayalam written in English letters)
const MANGLISH_WORDS = [
    // Question words
    'enthu', 'enthanu', 'enthaa', 'ethra', 'evide', 'evidey', 'aaru', 'aaranu',
    'engane', 'enganey', 'eppo', 'eppol', 'eppozha', 'enthina', 'enthinanu',
    'peru', 'pera', 'enn', 'ennu', 'enth', // name and common question forms

    // Common greetings and phrases
    'namaskaram', 'namaskar', 'sugham', 'sughamano', 'sughamaano',
    'nanni', 'sthothram', 'nannayittu', 'kollam', 'mathi',

    // Yes/No words - very common in voice
    'undu', 'undo', 'illa', 'illaa', 'aanu', 'anu', 'aanallo', 'allallo',
    'athe', 'athey', 'alle', 'ille', 'und', 'und', 'undoo', 'illaaa',

    // Verbs and common words
    'parayan', 'parayoo', 'parayamo', 'undakum', 'venam', 'vende', 'vendam',
    'ariyam', 'ariyilla', 'ariyumo', 'poyi', 'poyallo', 'arinjilla',
    'nokku', 'nokkoo', 'nokkanam', 'cheyyuka', 'cheyyanam', 'kudeyanu',
    'kitta', 'kittum', 'kittuo', 'tharam', 'tharao', 'tharanam', 'kittumo',
    'parayo', 'parayamo', 'parayumo', 'tharo', 'tharumo',

    // Pronouns
    'njan', 'njaan', 'enikk', 'enikku', 'enik', 'nee', 'ningal', 'ningalu',
    'avan', 'aval', 'avar', 'athil', 'ini', 'athinu', 'ithu', 'athu',
    'namukku', 'nammal', 'njangal', 'nammude', 'ente', 'ninte', 'avante',

    // College-specific Manglish
    'collegil', 'colleginte', 'admissionu', 'classil', 'libraryil',
    'hostelil', 'examinu', 'feeu', 'coursinu', 'semesteril', 'placementu',
    'principalinte', 'hodinte', 'departmentil', 'labsil', 'collegeinu',
    'feesu', 'coursil', 'branchil', 'seatsil', 'cutoff', 'rankinu',

    // Time and location
    'innu', 'innale', 'naale', 'ippo', 'ippol', 'angane', 'ivide', 'avide',
    'engott', 'evdey', 'evidanu', 'evidaya', 'evideyanu',

    // Common sentence patterns
    'nokki', 'kodukk', 'parayumo', 'ariyumo', 'aayirikkum', 'cheyyum',
    'edukkam', 'edukkumo', 'thudangum', 'kazhinju', 'mathiyaayo', 'okke',

    // Connecting words
    'enna', 'ennal', 'atho', 'allenkil', 'pakshe', 'pakshey', 'pinneed',
    'pore', 'kure', 'ellam', 'onnum', 'onum', 'onnumilla',

    // Malayalam verbs in Manglish
    'parayoo', 'paranju', 'kelkkoo', 'kelkku', 'nokkoo', 'varikku',
    'parayuvo', 'ariyuvo', 'kittuvo', 'tharuvo', 'cheyyuvo',
];

// Common English words that appear in Manglish (educational context)
const EDUCATIONAL_ENGLISH = [
    'admission', 'fee', 'fees', 'course', 'college', 'library', 'hostel',
    'placement', 'exam', 'semester', 'department', 'faculty', 'principal',
    'scholarship', 'certificate', 'degree', 'engineering', 'computer', 'science',
];

/**
 * Detects the language of the input text
 * @param text - The user input text
 * @returns 'ml' for Malayalam script, 'manglish' for Malayalam in English letters, 'en' for English
 */
export function detectLanguage(text: string): DetectedLanguage {
    if (!text || text.trim().length === 0) {
        return 'en'; // Default to English
    }

    const normalizedText = text.toLowerCase().trim();

    // Check for Malayalam script (Unicode)
    if (MALAYALAM_REGEX.test(text)) {
        return 'ml';
    }

    // Check for Manglish patterns
    const words = normalizedText.split(/\s+/);
    let manglishScore = 0;
    let englishScore = 0;

    for (const word of words) {
        // Clean the word (remove punctuation)
        const cleanWord = word.replace(/[?!.,;:'"()]/g, '');

        // Check if it's a known Manglish word
        if (MANGLISH_WORDS.some(mw => cleanWord.includes(mw) || mw.includes(cleanWord))) {
            manglishScore += 2;
        }

        // Check for common Manglish suffixes
        if (cleanWord.endsWith('il') || cleanWord.endsWith('inu') ||
            cleanWord.endsWith('anu') || cleanWord.endsWith('allo') ||
            cleanWord.endsWith('umo') || cleanWord.endsWith('aam') ||
            cleanWord.endsWith('um') || cleanWord.endsWith('oo')) {
            manglishScore += 1;
        }

        // Check for pure English educational terms
        if (EDUCATIONAL_ENGLISH.includes(cleanWord)) {
            englishScore += 0.5; // Less weight since these appear in Manglish too
        }

        // Common English question words
        if (['what', 'where', 'when', 'how', 'who', 'which', 'why', 'is', 'are', 'the', 'a', 'an'].includes(cleanWord)) {
            englishScore += 1;
        }
    }

    // Check for Manglish sentence patterns
    const manglishPatterns = [
        /enthu\s+.+\s*\??/i,           // "enthu ... ?"
        /evide\s+.+/i,                  // "evide ..."
        /engane\s+.+/i,                 // "engane ..."
        /ariyumo\s*\??/i,               // "ariyumo?"
        /.+\s+aanu\s*\??/i,             // "... aanu?"
        /.+\s+undu\s*\??/i,             // "... undu?"
        /.+\s+entha(nu)?\s*\??/i,       // "... enthanu?"
        /.+il\s+.+/i,                   // "...il ..." (Malayalam locative)
    ];

    for (const pattern of manglishPatterns) {
        if (pattern.test(normalizedText)) {
            manglishScore += 2;
        }
    }

    // Decision logic
    // If manglish score is significantly higher, it's likely Manglish
    if (manglishScore >= 2 && manglishScore > englishScore) {
        return 'manglish';
    }

    // Default to English
    return 'en';
}

/**
 * Gets the appropriate response language based on detected input language
 * @param detectedLang - The detected input language
 * @returns The language code to use for response
 */
export function getResponseLanguage(detectedLang: DetectedLanguage): 'en' | 'ml' | 'manglish' {
    // Return the same language for response - AI will respond appropriately
    return detectedLang;
}


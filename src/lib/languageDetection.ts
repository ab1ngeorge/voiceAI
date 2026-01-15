/**
 * Language Detection Utility
 * Auto-detects if user input is in English, Malayalam, or Manglish (Malayalam written in English letters)
 */

export type DetectedLanguage = 'en' | 'ml' | 'manglish';

// Malayalam Unicode range: \u0D00-\u0D7F
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;

// Common Manglish patterns and words (Malayalam written in English letters)
const MANGLISH_WORDS = [
    // Question words - extensive list
    'enthu', 'enthanu', 'enthaa', 'entha', 'ethra', 'evide', 'evidey', 'evdey',
    'aaru', 'aaranu', 'aar', 'engane', 'enganey', 'eppo', 'eppol', 'eppozha',
    'enthina', 'enthinanu', 'enthinu', 'peru', 'pera', 'enn', 'ennu', 'enth',
    'enthokke', 'evidokke', 'aarokke', 'enganeya', 'enthaya',

    // Common greetings and phrases
    'namaskaram', 'namaskar', 'namaste', 'sugham', 'sughamano', 'sughamaano',
    'nanni', 'sthothram', 'nannayittu', 'kollam', 'mathi', 'sheriyanu',
    'nalla', 'valare', 'nannaayi', 'superb', 'adipoli', 'pwoli',

    // Yes/No words - very common in voice
    'undu', 'undo', 'undoo', 'illa', 'illaa', 'illaaa', 'aanu', 'anu', 'aan',
    'aanallo', 'allallo', 'athe', 'athey', 'aathey', 'alle', 'ille', 'und',
    'sheriya', 'sheri', 'shariya', 'shari', 'okay', 'okey',

    // Verbs and common words
    'parayan', 'parayoo', 'parayamo', 'parayumo', 'parayo', 'paranju',
    'undakum', 'venam', 'vende', 'vendam', 'vendaa', 'vendathu',
    'ariyam', 'ariyilla', 'ariyumo', 'ariyuo', 'arinjilla', 'ariyaamallo',
    'nokku', 'nokkoo', 'nokkanam', 'nokkam', 'nokkatte',
    'cheyyuka', 'cheyyanam', 'cheyyam', 'cheyyumo', 'cheythu',
    'kitta', 'kittum', 'kittuo', 'kittumo', 'kittumoo', 'kittu',
    'tharam', 'tharao', 'tharanam', 'tharo', 'tharumo', 'tharuo',
    'poyi', 'poyallo', 'pokum', 'pokumo', 'povum', 'povumo',
    'varum', 'varuo', 'varumo', 'vannu', 'vaa', 'varoo',

    // Pronouns
    'njan', 'njaan', 'naan', 'enikk', 'enikku', 'enik', 'enak',
    'nee', 'ningal', 'ningalu', 'thaangal', 'thangal',
    'avan', 'aval', 'avar', 'ivar', 'athil', 'ini', 'athinu', 'ithu', 'athu',
    'namukku', 'nammal', 'njangal', 'nammude', 'ente', 'ninte', 'avante',
    'avalde', 'ivide', 'angane', 'ingane',

    // College-specific Manglish - ENHANCED
    'collegil', 'colleginte', 'collegeinu', 'collegil', 'college',
    'admissionu', 'admission', 'admissione', 'admsn',
    'classil', 'class', 'classinte',
    'libraryil', 'library', 'libraryude',
    'hostelil', 'hostel', 'hostelinte', 'hostelu', 'ladiesu', 'boysu',
    'examinu', 'exam', 'examsinu', 'examinte',
    'feeu', 'fee', 'feesu', 'fees',
    'coursinu', 'course', 'coursil', 'courseilu',
    'semesteril', 'semester', 'sem',
    'placementu', 'placement', 'jobbu', 'job', 'jobu',
    'principalinte', 'principal', 'principalu',
    'hodinte', 'hod', 'hodanu',
    'departmentil', 'department', 'dept', 'deptil',
    'labsil', 'lab', 'labu', 'labinu',
    'branchil', 'branch', 'branchu',
    'seatsil', 'seats', 'seat', 'seatu',
    'cutoff', 'rankinu', 'rank', 'ranku',
    'keam', 'keaminu', 'keamil', 'entrance',
    'btechinu', 'btech', 'mtechinu', 'mtech', 'mcainu', 'mca',
    'cse', 'ece', 'eee', 'mech', 'civil', 'itil',
    'wifi', 'wifiya', 'canteen', 'canteenu', 'canteenilu',
    'ground', 'sports', 'sportsu',

    // Time and location
    'innu', 'innale', 'naale', 'naalenu', 'ippo', 'ippol', 'ippozha',
    'angane', 'ivide', 'avide', 'evidanu', 'evidaya', 'evideyanu',
    'engott', 'evdey', 'evde', 'angott', 'ingott',

    // Common sentence patterns
    'nokki', 'kodukk', 'kodukkumo', 'kodukkuo',
    'aayirikkum', 'cheyyum', 'aakum', 'aakumo',
    'edukkam', 'edukkumo', 'edukkanam',
    'thudangum', 'thudanguo', 'thudangunnath',
    'kazhinju', 'kazhinjaal', 'mathiyaayo', 'okke', 'ellaam',

    // Connecting words
    'enna', 'ennal', 'atho', 'athoo', 'allenkil', 'allenki',
    'pakshe', 'pakshey', 'pinneed', 'pinne',
    'pore', 'kure', 'kurey', 'ellam', 'ellaam',
    'onnum', 'onum', 'onnumilla', 'mattenthenkilum',

    // Common conversational fillers
    'aah', 'hmm', 'oho', 'aaha', 'athaanu', 'athanu',
    'sherikkum', 'sheriaa', 'pinnalla', 'pinne',
    'aarelum', 'enthelum', 'evideyenkilum',

    // Emotional/reaction words
    'nannaayi', 'adipoli', 'kidu', 'kidilan', 'poli', 'pwoli',
    'kashtam', 'kashtamaanu', 'easy', 'easyaanu', 'tough',
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


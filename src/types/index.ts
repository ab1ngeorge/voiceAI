// Message types
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    language?: Language;
    isLoading?: boolean;
}

// Language types
export type Language = 'en' | 'ml' | 'manglish';

export interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
}

// Knowledge Base types
export interface FAQ {
    id: string;
    question: string;
    questionMalayalam?: string;
    answer: string;
    answerMalayalam?: string;
    category: string;
    keywords: string[];
}

export interface CampusLocation {
    id: string;
    name: string;
    malayalamName?: string;
    description: string;
    category: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    googleMapsLink: string;
    timing?: string;
    contact?: string;
    facilities?: string[];
    labs?: string[];
    services?: string[];
    equipment?: string[];
    capacity?: number | string;
    availability?: string;
}

export interface Branch {
    code: string;
    name: string;
    seats: {
        total: number;
        government: number;
        management: number;
        nri: number;
    };
    hod: {
        name: string;
        email: string;
        phone: string;
    };
    description: string;
    labs: string[];
}

export interface FeeStructure {
    tuitionFee: number;
    otherFees: number;
    total: number;
    frequency: string;
    description: string;
}

export interface Recruiter {
    topRecruiters: string[];
    sectors: string[];
}

export interface PlacementPackage {
    minimum: number;
    average: number;
    maximum: number;
}

// Voice recognition types
export interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export interface VoiceRecognitionState {
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    transcript: string;
}

// Chat state types
export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    language: Language;
}

// API Response types
export interface ChatResponse {
    response: string;
    source: 'knowledge_base' | 'ai' | 'fallback';
    language: Language;
}

// Search result types
export interface SearchResult {
    content: string;
    category: string;
    confidence: number;
    source: 'faq' | 'category' | 'location' | 'qa_database';
}

// Human response templates
export interface HumanResponses {
    greetings: {
        morning: string[];
        afternoon: string[];
        evening: string[];
        general: string[];
    };
    closing: string[];
    notFound: string[];
    confirmation: string[];
}

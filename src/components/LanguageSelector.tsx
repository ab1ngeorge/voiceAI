import { Languages, Sparkles } from 'lucide-react';
import type { Language, LanguageOption } from '../types';

const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'manglish', name: 'Manglish', nativeName: 'Manglish' },
];

interface LanguageSelectorProps {
    selectedLanguage: Language;
    onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
    const currentLang = languageOptions.find(l => l.code === selectedLanguage) || languageOptions[0];

    return (
        <div className="flex items-center gap-3">
            {/* Auto-detect indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-purple/20 border border-primary-500/30">
                <Sparkles className="w-3.5 h-3.5 text-primary-400 animate-pulse" />
                <span className="text-xs text-slate-300">
                    Auto-detecting:
                </span>
                <span className="text-xs font-semibold text-primary-300">
                    {currentLang.nativeName}
                </span>
            </div>

            {/* Language toggle buttons - now act as override/preference */}
            <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-400" />
                <div className="flex gap-1">
                    {languageOptions.map((option) => (
                        <button
                            key={option.code}
                            onClick={() => onLanguageChange(option.code)}
                            className={`lang-btn ${selectedLanguage === option.code ? 'active' : ''}`}
                            title={`${option.name} (click to prefer ${option.name} responses)`}
                        >
                            {option.nativeName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

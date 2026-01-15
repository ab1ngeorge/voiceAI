import { LanguageSelector } from './LanguageSelector';
import type { Language } from '../types';
import { GraduationCap, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
    language: Language;
    onLanguageChange: (language: Language) => void;
    autoSpeak?: boolean;
    onAutoSpeakToggle?: () => void;
}

export function Header({ language, onLanguageChange, autoSpeak = true, onAutoSpeakToggle }: HeaderProps) {
    return (
        <header className="glass-card sticky top-0 z-50 px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold gradient-text">
                            LBS College Assistant
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                            Your 24/7 Campus Guide 🎓
                        </p>
                    </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Auto-speak Toggle */}
                    {onAutoSpeakToggle && (
                        <button
                            onClick={onAutoSpeakToggle}
                            className={`p-2 rounded-lg transition-all duration-200 ${autoSpeak
                                    ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                                    : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50'
                                }`}
                            title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
                        >
                            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Language Selector */}
                    <LanguageSelector
                        selectedLanguage={language}
                        onLanguageChange={onLanguageChange}
                    />
                </div>
            </div>
        </header>
    );
}


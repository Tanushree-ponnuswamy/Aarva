import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'es' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
];

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => void;
  voiceEnabled: boolean;
  toggleVoice: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => !prev);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown asterisks
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick voice if matching language
    if (language.code === 'hi') utterance.lang = 'hi-IN';
    else if (language.code === 'ta') utterance.lang = 'ta-IN';
    else if (language.code === 'es') utterance.lang = 'es-ES';
    else if (language.code === 'fr') utterance.lang = 'fr-FR';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        voiceEnabled,
        toggleVoice,
        reducedMotion,
        toggleReducedMotion,
        speakText,
        stopSpeaking,
        isSpeaking
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

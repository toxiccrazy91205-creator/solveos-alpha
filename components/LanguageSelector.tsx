import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { code: 'auto', label: 'Auto Detect', flag: '✨' },
  { code: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'Russian', label: 'Русский', flag: '🇷🇺' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'Arabic', label: 'العربية', flag: '🇦🇪' },
  { code: 'Chinese', label: '中文', flag: '🇨🇳' },
];

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLanguageChange(lang.code)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
            currentLanguage === lang.code
              ? 'bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              : 'bg-white/5 border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

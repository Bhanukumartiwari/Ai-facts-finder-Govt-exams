import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const getButtonClasses = (lang: Language) => {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900';
    if (language === lang) {
      return `${baseClasses} bg-cyan-600 text-white`;
    }
    return `${baseClasses} bg-slate-700 text-slate-300 hover:bg-slate-600`;
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg">
      <button onClick={() => setLanguage('en')} className={getButtonClasses('en')}>
        English
      </button>
      <button onClick={() => setLanguage('hi')} className={getButtonClasses('hi')}>
        हिंदी
      </button>
    </div>
  );
};

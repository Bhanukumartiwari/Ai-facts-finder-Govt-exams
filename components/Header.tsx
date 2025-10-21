import React from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7v0A2.5 2.5 0 0 1 7 4.5v0A2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7v0A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 14.5 2z" />
    <path d="M12 17.5A2.5 2.5 0 0 1 9.5 15v0a2.5 2.5 0 0 1 2.5-2.5v0A2.5 2.5 0 0 1 14.5 15v0a2.5 2.5 0 0 1-2.5 2.5z" />
    <path d="M4.5 10.5A2.5 2.5 0 0 1 7 8v0a2.5 2.5 0 0 1 2.5 2.5v0A2.5 2.5 0 0 1 7 13v0a2.5 2.5 0 0 1-2.5-2.5z" />
    <path d="M19.5 10.5a2.5 2.5 0 0 1-2.5 2.5v0a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5v0a2.5 2.5 0 0 1 2.5 2.5z" />
    <path d="M12 17.5v4.5" />
    <path d="M9.5 7H7" />
    <path d="M14.5 7H17" />
    <path d="M17 10.5v2.5" />
    <path d="M7 10.5v2.5" />
    <path d="M9.5 15c-1 2-2 3-2 4.5" />
    <path d="M14.5 15c1 2 2 3 2 4.5" />
  </svg>
);

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const T = translations[language];

  return (
    <header className="text-center mb-8 relative">
       <div className="absolute top-0 right-0">
         <LanguageSwitcher language={language} setLanguage={setLanguage} />
       </div>
      <div className="flex items-center justify-center space-x-3 mb-2 pt-12 sm:pt-0">
        <BrainIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-500 text-transparent bg-clip-text">
          {T.appTitle}
        </h1>
      </div>
      <p className="text-slate-400 max-w-2xl mx-auto">
        {T.appDescription}
      </p>
    </header>
  );
};
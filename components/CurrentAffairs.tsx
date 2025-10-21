import React, { useState } from 'react';
import { generateCurrentAffairs } from '../services/geminiService';
import { Language } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ActionButtons } from './ActionButtons';
import { translations } from '../translations';

interface CurrentAffairsProps {
  language: Language;
}

export const CurrentAffairs: React.FC<CurrentAffairsProps> = ({ language }) => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const T = translations[language];

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await generateCurrentAffairs(language);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatContentForSharing = (): string => {
    if (!results.length) return '';
    const listText = results.map(item => `- ${item}`).join('\n');
    return `${T.currentAffairsHeader}\n\n${listText}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-base"
        >
          {isLoading ? <LoadingSpinner /> : T.generateCurrentAffairsButton}
        </button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <LoadingSpinner />
          <p>{T.generatingAffairs}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-cyan-400">{T.currentAffairsHeader}</h3>
              <ActionButtons 
                  language={language}
                  contentToShare={formatContentForSharing()}
                  downloadFileName="current_affairs_briefing.txt"
              />
          </div>
          <ul className="space-y-2 list-disc list-inside bg-slate-800/70 p-4 rounded-lg">
            {results.map((fact, index) => (
              <li key={index} className="text-slate-300">{fact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

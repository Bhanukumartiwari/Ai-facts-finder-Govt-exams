import React, { useState, useEffect, useRef } from 'react';
import { generateFactsForTopic } from '../services/geminiService';
import { FactResult, Language } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { TopicButton } from './TopicButton';
import { translations } from '../translations';
import { ActionButtons } from './ActionButtons';

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M12 8v4l2 2"/></svg>
);

interface FactGeneratorProps {
  language: Language;
}

export const FactGenerator: React.FC<FactGeneratorProps> = ({ language }) => {
  const [topic, setTopic] = useState<string>('');
  const [results, setResults] = useState<FactResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const T = translations[language];
  const PREDEFINED_TOPICS = T.predefinedTopics;
  
  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('factHistory') || '[]');
      setHistory(savedHistory);
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);
  
  // Close history dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateHistory = (newTopic: string) => {
    const updatedHistory = [newTopic, ...history.filter(h => h.toLowerCase() !== newTopic.toLowerCase())].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('factHistory', JSON.stringify(updatedHistory));
  };
  
  const handleGenerate = async (currentTopic: string) => {
    if (!currentTopic.trim()) {
      setError(T.errorEnterTopic);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setIsHistoryVisible(false);

    try {
      const data = await generateFactsForTopic(currentTopic, language);
      setResults(data);
      setTopic(currentTopic);
      updateHistory(currentTopic);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    handleGenerate(selectedTopic);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(topic);
  }
  
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('factHistory');
    setIsHistoryVisible(false);
  };

  const formatContentForSharing = (): string => {
    if (!results) return '';
    const factsText = results.facts.map(f => `- ${f}`).join('\n');
    const topicsText = results.related_topics.map(t => `- ${t}`).join('\n');
    return `Facts about "${topic}":\n\n${factsText}\n\nRelated Topics:\n${topicsText}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 relative">
        <form onSubmit={handleSubmit} className="flex-grow flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={T.factGeneratorPlaceholder}
              className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner /> : T.generateFactsButton}
            </button>
        </form>
         <div className="relative" ref={historyRef}>
            <button
                onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                disabled={history.length === 0}
                className="w-full sm:w-auto bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <HistoryIcon />
                <span>{T.historyButton}</span>
            </button>
            {isHistoryVisible && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                    {history.length > 0 ? (
                        <>
                            <ul className="max-h-60 overflow-y-auto">
                                {history.map((item, index) => (
                                    <li key={index}
                                        className="text-slate-300 px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm"
                                        onClick={() => handleTopicClick(item)}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-slate-600 p-2">
                                <button onClick={handleClearHistory}
                                    className="w-full text-center text-xs text-red-400 hover:text-red-300">
                                    {T.clearHistoryButton}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm p-4">{T.noHistoryText}</p>
                    )}
                </div>
            )}
         </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-slate-400 mr-2">{T.tryTheseTopics}</span>
        {PREDEFINED_TOPICS.map(t => <TopicButton key={t} topic={t} onClick={handleTopicClick} />)}
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <LoadingSpinner />
          <p>{T.aiThinking} "{topic}"</p>
        </div>
      )}

      {results && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-cyan-400">{T.factsHeader}</h3>
              <ActionButtons
                language={language}
                contentToShare={formatContentForSharing()}
                downloadFileName={`${topic.replace(/\s+/g, '_')}_facts.txt`}
              />
            </div>
            <ul className="space-y-2 list-disc list-inside bg-slate-800/70 p-4 rounded-lg">
              {results.facts.map((fact, index) => (
                <li key={index} className="text-slate-300">{fact}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-indigo-400 mb-3">{T.relatedTopicsHeader}</h3>
            <div className="flex flex-wrap gap-2">
              {results.related_topics.map((relatedTopic, index) => (
                <TopicButton key={index} topic={relatedTopic} onClick={handleTopicClick} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

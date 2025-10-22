
import React, { useState } from 'react';
import { generateExamInfo } from '../services/geminiService.ts';
import { ExamInfoResult, Language } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { translations } from '../translations.ts';
import { ActionButtons } from './ActionButtons.tsx';

interface ExamInfoProps {
  language: Language;
}

export const ExamInfo: React.FC<ExamInfoProps> = ({ language }) => {
  const [examName, setExamName] = useState<string>('');
  const [results, setResults] = useState<ExamInfoResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const T = translations[language];

  const handleGenerate = async () => {
    if (!examName.trim()) {
      setError(T.errorExamName);
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await generateExamInfo(examName, language);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const formatContentForSharing = (): string => {
    if (!results) return '';
    return `
${T.examInfoHeader}: ${examName}
---------------------------------

**${T.examDescription}:**
${results.description}

**${T.examDates}:**
- ${T.examApplyStart}: ${results.apply_start_date}
- ${T.examApplyEnd}: ${results.apply_end_date}

**${T.examPattern}:**
${results.exam_pattern}

**${T.examSyllabus}:**
${results.syllabus}
    `.trim();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder={T.examInfoPlaceholder}
          className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : T.getExamInfoButton}
        </button>
      </form>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <LoadingSpinner />
          <p>{T.generatingExamInfo} "{examName}"</p>
        </div>
      )}

      {results && (
        <div className="space-y-6 animate-fade-in bg-slate-800/70 p-4 sm:p-6 rounded-lg">
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <h3 className="text-xl sm:text-2xl font-bold text-cyan-400">{T.examInfoHeader}: {examName}</h3>
            <ActionButtons
              language={language}
              contentToShare={formatContentForSharing()}
              downloadFileName={`${examName.replace(/\s+/g, '_')}_info.txt`}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2">{T.examDescription}</h4>
              <p className="text-slate-300 leading-relaxed">{results.description}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2">{T.examDates}</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li><span className="font-medium">{T.examApplyStart}:</span> {results.apply_start_date}</li>
                <li><span className="font-medium">{T.examApplyEnd}:</span> {results.apply_end_date}</li>
              </ul>
            </div>
             <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2">{T.examPattern}</h4>
              <div className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-3 rounded-md text-sm leading-relaxed">{results.exam_pattern}</div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2">{T.examSyllabus}</h4>
              <div className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-3 rounded-md text-sm leading-relaxed">{results.syllabus}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
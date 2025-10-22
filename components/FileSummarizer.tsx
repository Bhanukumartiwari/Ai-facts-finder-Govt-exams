
import React, { useState, useRef } from 'react';
import { summarizeText } from '../services/geminiService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { translations } from '../translations.ts';
import { Language } from '../types.ts';
import { ActionButtons } from './ActionButtons.tsx';

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

interface FileSummarizerProps {
  language: Language;
}

export const FileSummarizer: React.FC<FileSummarizerProps> = ({ language }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const T = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset state for new file
      setSummary('');
      setError(null);

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContent(text);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
        setFileName('');
        setFileContent('');
      };
      reader.readAsText(file);
    }
  };
  
  const handleSummarize = async () => {
    if (!fileContent) {
      setError(T.errorNoFile);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const result = await summarizeText(fileContent, language);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during summarization.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
        <FileIcon className="mx-auto h-12 w-12 text-slate-500"/>
        <label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-slate-300">
          <span className="text-cyan-400 font-semibold cursor-pointer hover:underline">{T.uploadFile}</span> {T.dragAndDrop}
        </label>
        <p className="mt-1 text-xs text-slate-500">{T.fileTypesHint}</p>
        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.csv,text/plain" />
      </div>

        {fileName && <div className="text-center text-slate-400">{T.selectedFile} <span className="font-medium text-slate-200">{fileName}</span></div>}

      <div className="text-center">
        <button
          onClick={handleSummarize}
          disabled={!fileContent || isLoading}
          className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isLoading ? <LoadingSpinner /> : T.summarizeFileButton}
        </button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <LoadingSpinner />
          <p>{T.aiSummarizing}</p>
        </div>
      )}

      {summary && (
        <div className="animate-fade-in space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-cyan-400">{T.summaryHeader}</h3>
                <ActionButtons 
                    language={language}
                    contentToShare={summary}
                    downloadFileName={`summary_${fileName}.txt`}
                />
            </div>
            <div className="bg-slate-800/70 p-4 rounded-lg text-slate-300 whitespace-pre-wrap leading-relaxed">
                {summary}
            </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { getFactOfTheDay } from './services/geminiService.ts';
import { FactGenerator } from './components/FactGenerator.tsx';
import { FileSummarizer } from './components/FileSummarizer.tsx';
import { CurrentAffairs } from './components/CurrentAffairs.tsx';
import { ExamInfo } from './components/ExamInfo.tsx';
import { TabButton } from './components/TabButton.tsx';
import { Header } from './components/Header.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { translations } from './translations.ts';
import { Language } from './types.ts';

type Tab = 'facts' | 'summarizer' | 'currentAffairs' | 'examInfo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('facts');
  const [factOfTheDay, setFactOfTheDay] = useState<string>('');
  const [isLoadingFact, setIsLoadingFact] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');

  const T = translations[language];

  useEffect(() => {
    const fetchFact = async () => {
      setIsLoadingFact(true);
      try {
        const fact = await getFactOfTheDay(language);
        setFactOfTheDay(fact);
      } catch (error: any) {
        // Display the user-friendly error message from the service
        setFactOfTheDay(error.message || 'Could not fetch the fact of the day.');
      } finally {
        setIsLoadingFact(false);
      }
    };
    fetchFact();
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Header language={language} setLanguage={setLanguage} />

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 my-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-cyan-400 mb-2">{T.factOfTheDay}</h2>
          {isLoadingFact ? (
            <div className="flex items-center space-x-2 text-slate-400">
              <LoadingSpinner />
              <span>{T.fetchingFact}</span>
            </div>
          ) : (
            <p className="text-slate-300 italic">"{factOfTheDay}"</p>
          )}
        </div>

        <div className="flex flex-wrap space-x-2 border-b border-slate-700 mb-6">
          <TabButton
            label={T.topicFactsTab}
            isActive={activeTab === 'facts'}
            onClick={() => setActiveTab('facts')}
          />
          <TabButton
            label={T.fileSummarizerTab}
            isActive={activeTab === 'summarizer'}
            onClick={() => setActiveTab('summarizer')}
          />
           <TabButton
            label={T.currentAffairsTab}
            isActive={activeTab === 'currentAffairs'}
            onClick={() => setActiveTab('currentAffairs')}
          />
          <TabButton
            label={T.examInfoTab}
            isActive={activeTab === 'examInfo'}
            onClick={() => setActiveTab('examInfo')}
          />
        </div>

        <main>
          {activeTab === 'facts' && <FactGenerator language={language} />}
          {activeTab === 'summarizer' && <FileSummarizer language={language} />}
          {activeTab === 'currentAffairs' && <CurrentAffairs language={language} />}
          {activeTab === 'examInfo' && <ExamInfo language={language} />}
        </main>

        <footer className="text-center text-xs text-slate-500 mt-12">
          <p>{T.footerText}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
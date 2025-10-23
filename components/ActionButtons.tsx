import React, { useState, useEffect } from 'react';
import { translations } from '../translations.ts';
import { Language } from '../types.ts';

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface ActionButtonsProps {
  language: Language;
  contentToShare: string;
  downloadFileName: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ language, contentToShare, downloadFileName }) => {
  const T = translations[language];
  const [copyStatus, setCopyStatus] = useState<string>(T.shareButton);
  const [isShareSupported, setIsShareSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsShareSupported(!!navigator.share);
  }, []);

  // Reset copy status when language changes
  useEffect(() => {
    setCopyStatus(T.shareButton);
  }, [language, T.shareButton]);

  const handleDownload = () => {
    if (!contentToShare) return;
    const blob = new Blob([contentToShare], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!contentToShare) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Content',
          text: contentToShare,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(contentToShare).then(() => {
        setCopyStatus(T.copiedToClipboard);
        setTimeout(() => setCopyStatus(T.shareButton), 2000);
      });
    }
  };
  
  const baseButtonClasses = "flex items-center space-x-2 text-xs font-semibold py-1 px-2.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const shareButtonClasses = `${baseButtonClasses} bg-slate-600 hover:bg-slate-500 text-slate-200 focus:ring-cyan-500`;
  const downloadButtonClasses = `${baseButtonClasses} bg-slate-700 hover:bg-slate-600 text-slate-300 focus:ring-indigo-500`;


  return (
    <div className="flex items-center space-x-2">
      <button onClick={handleShare} className={shareButtonClasses} title={isShareSupported ? T.shareButton : "Copy to clipboard"}>
        <ShareIcon />
        <span>{copyStatus}</span>
      </button>
      <button onClick={handleDownload} className={downloadButtonClasses} title={T.downloadButton}>
        <DownloadIcon />
        <span>{T.downloadButton}</span>
      </button>
    </div>
  );
};
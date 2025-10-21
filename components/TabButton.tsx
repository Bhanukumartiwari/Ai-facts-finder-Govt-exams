
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  const activeClasses = 'bg-slate-700 text-cyan-400 border-cyan-400';
  const inactiveClasses = 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500';

  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 rounded-t-md ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

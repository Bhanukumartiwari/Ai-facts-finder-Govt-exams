
import React from 'react';

interface TopicButtonProps {
  topic: string;
  onClick: (topic: string) => void;
}

export const TopicButton: React.FC<TopicButtonProps> = ({ topic, onClick }) => {
  return (
    <button
      onClick={() => onClick(topic)}
      className="bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200 px-3 py-1.5 text-sm rounded-full shadow-sm"
    >
      {topic}
    </button>
  );
};

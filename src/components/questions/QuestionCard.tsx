import React from 'react';
import { type Question } from '../../types/question';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string | number;
  onAnswerSelect: (option: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedAnswer, onAnswerSelect }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-[#2a2d2e] leading-relaxed">
          {question?.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {question?.options?.map((option, i) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={i}
              onClick={() => onAnswerSelect(option)}
              className={`p-4 text-left rounded-sm border transition-all flex items-center gap-4 group ${isSelected
                ? 'border-[#d4aa37] bg-[#fdf9ec] shadow-sm'
                : 'border-[#e5e7e8] hover:border-[#d4aa37]/60 hover:bg-[#fdfcf8] bg-white'
                }`}
            >
              <div className={`w-7 h-7 rounded-sm border-2 flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${isSelected
                ? 'bg-[#d4aa37] border-[#d4aa37] text-white'
                : 'border-[#d0d3d4] text-[#9aa0a1] group-hover:border-[#d4aa37] group-hover:text-[#d4aa37]'
                }`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className={`text-sm md:text-base leading-snug ${isSelected ? 'font-semibold text-[#1a1d1e]' : 'font-medium text-[#3c4142]'
                }`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;

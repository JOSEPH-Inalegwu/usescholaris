import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';

const ReviewItem: React.FC<{ q: any; i: number; isFailed: boolean }> = ({ q, i, isFailed }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={`p-6 rounded-sm border-l-4 ${isFailed ? 'border-l-[#b32839]' : 'border-l-green-500'} bg-white border border-[#adb3b4]/20 shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <p className="font-bold text-[#2a2d2e] text-sm">Q{i + 1}: {q.question}</p>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-[9px] font-bold uppercase tracking-widest text-[#d4aa37] hover:underline"
        >
          {expanded ? 'Hide Explanation' : 'See Explanation'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#f2f4f4]">
          <p className="text-xs text-[#757c7d] mb-4">Correct Answer: <span className="font-bold text-[#2d3435]">{Array.isArray(q.options) ? q.options[Number(q.correctAnswer)] : q.correctAnswer}</span></p>
          {q.rationale && (
            <div className="p-3 bg-[#fdfcf8] border-l-2 border-[#d4aa37]">
              <p className="text-[9px] font-bold text-[#d4aa37] uppercase tracking-widest mb-1">💡 Correct Logic</p>
              <p className="text-xs text-[#5a6061] leading-relaxed">{q.rationale}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const [currentIdx, setCurrentIdx] = React.useState(0);

  const failedQuestions = useMemo(() => {
    if (!state?.questions || !state?.answers) return [];
    return state.questions.map((q: any, i: number) => {
        const userAns = state.answers[i];
        const correctOptionText = Array.isArray(q.options) ? q.options[Number(q.correctAnswer)] : q.correctAnswer;
        return { ...q, isFailed: String(userAns) !== String(correctOptionText), originalIndex: i, userAns };
    }).filter((q: any) => q.isFailed);
  }, [state]);

  if (!failedQuestions.length) {
    return <DashboardLayout><div className="p-8 text-center font-['Lora']">No mistakes to review. Great job! <button onClick={() => navigate('/dashboard')} className="block mx-auto mt-4 px-6 py-3 bg-[#2a2d2e] text-white text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#b32839]">Return Home</button></div></DashboardLayout>;
  }

  const q = failedQuestions[currentIdx];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 font-['Lora'] space-y-8">
        {/* Progress & Nav */}
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest">Mistake {currentIdx + 1} of {failedQuestions.length}</span>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#f2f4f4] text-[#2a2d2e] text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#adb3b4]/20 transition-all">Done Reviewing</button>
        </div>

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Question */}
            <div className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-[#2a2d2e] leading-relaxed">{q.question}</h2>
                <div className="p-4 bg-[#b32839]/5 border border-[#b32839]/20 rounded-sm">
                    <p className="text-[9px] font-bold text-[#b32839] uppercase tracking-widest mb-1">Your Incorrect Answer</p>
                    <p className="text-sm font-bold text-[#2a2d2e]">{q.userAns || 'Skipped'}</p>
                </div>
            </div>

            {/* Right: Correct Answer & Rationale */}
            <div className="space-y-6">
                <div className="p-8 bg-green-50 border border-green-200 rounded-sm">
                    <p className="text-[9px] font-bold text-green-700 uppercase tracking-widest mb-2">Correct Answer</p>
                    <p className="text-lg font-black text-green-900">{Array.isArray(q.options) ? q.options[Number(q.correctAnswer)] : q.correctAnswer}</p>
                </div>
                
                {q.rationale && (
                    <div className="p-8 bg-[#fdfcf8] border border-[#d4aa37]/20 rounded-sm">
                        <p className="text-[9px] font-bold text-[#d4aa37] uppercase tracking-widest mb-3">💡 The Correct Logic</p>
                        <p className="text-sm text-[#5a6061] leading-relaxed font-medium">{q.rationale}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex justify-between pt-8 border-t border-[#f2f4f4]">
            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} className="px-6 py-3 border border-[#adb3b4]/20 text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#f2f4f4] disabled:opacity-20 transition-all">Previous</button>
            <button disabled={currentIdx === failedQuestions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)} className="px-6 py-3 bg-[#2a2d2e] text-white text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#b32839] disabled:opacity-20 transition-all">Next</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewPage;

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';

interface LocationState {
  score: number;
  total: number;
  courseSlug: string;
  incorrect?: number;
  skipped?: number;
  duration?: number;
  categoryBreakdown?: Record<string, { correct: number; total: number }>;
  questions?: any[];
  answers?: Record<number, string | number>;
}

const ResultAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState || { score: 0, total: 40, courseSlug: 'Unknown', answers: {} };

  const { score, total, courseSlug, incorrect = 0, skipped = 0, duration = 0, categoryBreakdown = {}, questions = [], answers = {} } = state;

  const percentage = useMemo(() => Math.round((score / total) * 100), [score, total]);

  const formattedDuration = useMemo(() => {
    if (!duration) return "--:--";
    const totalSeconds = Math.floor(duration / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [duration]);

  const filteredQuestions = useMemo(() => {
    return questions.map((q, i) => {
      const userAns = answers[i];
      const correctOptionText = Array.isArray(q.options)
        ? q.options[Number(q.correctAnswer)]
        : q.correctAnswer;
      const isFailed = String(userAns) !== String(correctOptionText);
      return { ...q, isFailed, originalIndex: i };
    }).filter(q => q.isFailed);
  }, [questions, answers]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-['Lora']">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-[#2a2d2e] mb-2">Exam Summary</h1>
            <p className="text-[11px] font-bold text-[#b32839] uppercase tracking-[0.2em]">{courseSlug}</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-[#2a2d2e]">{score}<span className="text-xl text-[#adb3b4]">/{total}</span></p>
              <p className="text-[10px] font-bold text-[#757c7d] uppercase tracking-widest mt-1">Score</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[#2a2d2e]">{percentage}%</p>
              <p className="text-[10px] font-bold text-[#757c7d] uppercase tracking-widest mt-1">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-[#2a2d2e]">{formattedDuration}</p>
              <p className="text-[10px] font-bold text-[#757c7d] uppercase tracking-widest mt-1">Time</p>
            </div>
          </div>
        </header>

        {/* Content Section: 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Column 1: Performance Breakdown & Mastery */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
              <h3 className="text-[11px] font-black text-[#2a2d2e] uppercase tracking-[0.2em] mb-6">Performance Breakdown</h3>
              <div className="space-y-4">
                {[{ label: 'Correct', val: score, color: 'bg-green-500' }, { label: 'Incorrect', val: incorrect, color: 'bg-[#b32839]' }, { label: 'Skipped', val: skipped, color: 'bg-[#adb3b4]' }].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${item.color}`} />
                      <span className="text-xs font-bold text-[#5a6061] uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="font-bold text-[#2a2d2e]">{item.val}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
              <h3 className="text-[11px] font-black text-[#2a2d2e] uppercase tracking-[0.2em] mb-6">Subject Mastery</h3>
              {Object.entries(categoryBreakdown).map(([cat, stats]) => (
                <div key={cat} className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-[#5a6061]">{cat}</span>
                    <span className="font-bold text-[#2d3435]">{Math.round((stats.correct / stats.total) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-[#f2f4f4] rounded-full"><div className="h-full bg-[#d4aa37] rounded-full" style={{ width: `${(stats.correct / stats.total) * 100}%` }} /></div>
                </div>
              ))}
            </section>
          </div>

          {/* Quick Review Preview */}
          <section className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-black text-[#2a2d2e] uppercase tracking-[0.2em] mb-6">Quick Mistake Preview</h3>

            {filteredQuestions.length > 0 ? (
              <div className="space-y-4 mb-8">
                {filteredQuestions.slice(0, 3).map((q) => (
                  <div key={q.id} className="p-4 bg-[#fdfcf8] border-l-2 border-[#b32839]">
                    <p className="font-bold text-[#2a2d2e] text-xs leading-relaxed">Q: {q.question}</p>
                  </div>
                ))}
                {filteredQuestions.length > 3 && (
                  <p className="text-[10px] text-[#adb3b4] font-bold text-center">...and {filteredQuestions.length - 3} more</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#5a6061] italic mb-8">No mistakes to review. Great job!</p>
            )}

            <button
              onClick={() => navigate('/results/review', { state: { questions, answers } })}
              className="mt-auto px-6 py-3 bg-[#2a2d2e] text-white text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#b32839] transition-all w-full"
            >
              {filteredQuestions.length > 0 ? 'Review Failed Questions' : 'Back to Dashboard'}
            </button>
          </section>

        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 pt-8">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-[#2a2d2e] text-white text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#b32839] transition-all">Command Center</button>
          <button onClick={() => navigate('/questions')} className="px-6 py-3 bg-white text-[#2a2d2e] border border-[#2a2d2e] text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#f2f4f4] transition-all">Try Again</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultAnalysis;

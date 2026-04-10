import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ExamSession, useSessionPersistence } from '../../hooks/useSessionPersistence';
import { type Question } from '../../types/question';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

interface ExamPortalProps {
  session: ExamSession;
  initialQuestions?: Question[];
}

const ExamPortal: React.FC<ExamPortalProps> = ({ session, initialQuestions }) => {
  const { updateAnswers, clearSession } = useSessionPersistence();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [loading, setLoading] = useState(!initialQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>(session.selectedAnswers || {});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialQuestions) {
      const fetchQuestions = async () => {
        try {
          const docId = `cs_300_${session.courseSlug}`;
          const docRef = doc(db, 'course_banks', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const allQuestions = data.questions as Question[];
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, 40));
          }
        } catch (err) {
          console.error('Failed to fetch questions:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [initialQuestions, session.courseSlug]);

  const handleSubmission = useCallback(async (finalAnswers: Record<number, string | number>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let score = 0;
      questions.forEach((q, i) => {
        const userAns = finalAnswers[i];
        const correctOptionText = Array.isArray(q.options)
          ? q.options[Number(q.correctAnswer)]
          : q.correctAnswer;
        if (String(userAns) === String(correctOptionText)) {
          score++;
        }
      });

      const duration = Date.now() - session.startTime;
      const attemptData = {
        userId: user?.uid,
        courseSlug: session.courseSlug,
        score,
        totalQuestions: questions.length,
        answers: finalAnswers,
        startTime: session.startTime,
        endTime: Date.now(),
        duration,
        isRanked: session.isRanked,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'exam_attempts'), attemptData);

      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          'stats.totalPoints': increment(score),
          'stats.totalQuestions': increment(questions.length),
          'stats.totalTime': increment(duration),
          'stats.totalAttempts': increment(1),
        });
      }

      clearSession();


      navigate('/results', {
        replace: true,
        state: {
          score,
          total: questions.length,
          courseSlug: session.courseSlug
        }
      });
    } catch (err) {
      console.error('Submission failed:', err);
      setIsSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  }, [clearSession, isSubmitting, navigate, questions, session.courseSlug, session.isRanked, session.startTime, user?.uid]);

  useEffect(() => {
    const totalDuration = 30 * 60 * 1000;
    const elapsed = Date.now() - session.startTime;
    const remaining = Math.max(0, Math.floor((totalDuration - elapsed) / 1000));
    setTimeLeft(remaining);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmission(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime, answers, handleSubmission]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      updateAnswers(answers);
    }
  }, [answers, updateAnswers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => {
    const newAnswers = { ...answers, [currentIdx]: option };
    setAnswers(newAnswers);
    if (autoNext && currentIdx < 39) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 250);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentIdx)) newFlagged.delete(currentIdx);
    else newFlagged.add(currentIdx);
    setFlagged(newFlagged);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] font-['Lora'] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#b32839]/20 border-t-[#b32839] rounded-full animate-spin" />
          <p className="text-[#757c7d] font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = 40 - answeredCount;
  const progressPct = (answeredCount / 40) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Lora'] flex flex-col">

      {/* Top Bar */}
      <header className="bg-white border-b border-[#adb3b4]/20 sticky top-0 z-10">
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-[#2a2d2e] text-white text-[10px] font-bold rounded-sm uppercase tracking-wider">
              {session.courseSlug.toUpperCase()}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-[#b32839] uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b32839] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b32839]" />
              </span>
              Live
            </div>
          </div>


          {/* Right */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-sm font-bold tabular-nums tracking-wider transition-colors ${isLowTime ? 'bg-[#b32839]/5 border-[#b32839]/30 text-[#b32839]' : 'bg-[#f2f4f4] border-[#adb3b4]/10 text-[#2a2d2e]'
              }`}>
              <span className="material-symbols-outlined text-xs">timer</span>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => handleSubmission(answers)}
              disabled={isSubmitting}
              className="px-6 md:px-8 py-3 bg-[#b32839] text-white text-[12px] font-bold rounded-sm hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#f2f4f4]">
          <motion.div
            className="h-full bg-[#d4aa37]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-10 gap-6 max-w-[1400px] mx-auto w-full">

        {/* Main Question Area */}
        <main className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-5 md:p-8 shadow-sm">

            {/* Question header row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#adb3b4] tracking-widest">Q{currentIdx + 1} <span className="font-normal text-[#adb3b4]/60">/ 40</span></span>
                {currentQuestion?.category && (
                  <>
                    <span className="text-[#e0e0e0]">|</span>
                    <span className="text-[10px] font-bold text-[#d4aa37] uppercase tracking-wider">{currentQuestion.category}</span>
                  </>
                )}
              </div>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold transition-all ${flagged.has(currentIdx)
                  ? 'bg-[#d4aa37] border-[#d4aa37] text-white'
                  : 'bg-white border-[#adb3b4]/30 text-[#757c7d] hover:border-[#d4aa37] hover:text-[#d4aa37]'
                  }`}
              >
                <span className="material-symbols-outlined text-xs">flag</span>
                <span className="hidden sm:inline">{flagged.has(currentIdx) ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Question text */}
            <h2 className="text-lg md:text-2xl font-bold text-[#1a1d1e] leading-[1.5] mb-7">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion?.options?.map((option, i) => {
                const isSelected = answers[currentIdx] === option;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(option)}
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

          {/* Navigation */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-[#757c7d] disabled:opacity-20 hover:text-[#2a2d2e] border border-[#adb3b4]/20 rounded-sm hover:border-[#adb3b4]/40 transition-all disabled:border-transparent"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Previous
            </button>

            {/* Mobile question counter */}
            <span className="text-[10px] font-bold text-[#adb3b4] md:hidden">{currentIdx + 1} / 40</span>

            <button
              onClick={() => currentIdx === 39 ? handleSubmission(answers) : setCurrentIdx(currentIdx + 1)}
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-6 py-3 text-[12px] font-bold text-white rounded-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 ${currentIdx === 39 ? 'bg-[#b32839]' : 'bg-[#2a2d2e]'
                }`}
            >
              {currentIdx === 39 ? (isSubmitting ? 'Saving...' : 'Submit Exam') : 'Next'}
              <span className="material-symbols-outlined text-xs">
                {currentIdx === 39 ? 'check_circle' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 space-y-4">

          {/* Question Map */}
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-[#2a2d2e] uppercase tracking-wider">Question Map</h3>
              <div className="flex items-center gap-2 text-[10px] text-[#adb3b4]">
                <span className="font-bold text-[#2a2d2e]">{answeredCount}</span>
                <span>/</span>
                <span>40</span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 40 }).map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCurrent = currentIdx === i;
                const isFlagged = flagged.has(i);

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    title={`Question ${i + 1}${isFlagged ? ' (flagged)' : ''}${isAnswered ? ' (answered)' : ''}`}
                    className={`aspect-square rounded-sm text-[10px] font-bold transition-all flex items-center justify-center ${isCurrent
                      ? 'bg-[#2a2d2e] text-white'
                      : isFlagged
                        ? 'bg-[#d4aa37] text-white'
                        : isAnswered
                          ? 'bg-[#2a2d2e]/10 text-[#2a2d2e] border border-[#2a2d2e]/10'
                          : 'border border-[#adb3b4]/20 text-[#adb3b4] hover:border-[#757c7d]'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-[10px] text-[#757c7d]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#2a2d2e]/10 border border-[#2a2d2e]/10" /> Done</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#d4aa37]" /> Flagged</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm border border-[#adb3b4]/20" /> Skipped</div>
            </div>
          </div>

          {/* Unanswered warning */}
          {unansweredCount > 0 && (
            <div className="bg-[#b32839]/5 border border-[#b32839]/10 rounded-sm px-4 py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#b32839]">warning</span>
              <p className="text-[12px] text-[#b32839] font-bold">
                {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
              </p>
            </div>
          )}

          {/* Auto-advance toggle */}
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#2a2d2e]">Auto-advance</p>
                <p className="text-[12px] text-[#757c7d] mt-0.5">Move to next after selection</p>
              </div>
              <button
                onClick={() => setAutoNext(!autoNext)}
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${autoNext ? 'bg-[#d4aa37]' : 'bg-[#adb3b4]/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${autoNext ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

        </aside>
      </div>

      {/* Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md"
          >
            <div className="w-10 h-10 border-2 border-[#b32839]/20 border-t-[#b32839] rounded-full animate-spin mb-6" />
            <h2 className="font-bold text-[#2a2d2e] tracking-wider">Submitting your exam</h2>
            <p className="text-[12px] text-[#757c7d] mt-2">Please don't close this page.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPortal;

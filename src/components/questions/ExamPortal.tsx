import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ExamSession, useSessionPersistence } from '../../hooks/useSessionPersistence';
import { type Question } from '../../types/question';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

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
            // Simple shuffle and slice
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
        // correctAnswer is stored as an index — resolve it to the option text
        const correctOptionText = Array.isArray(q.options)
          ? q.options[Number(q.correctAnswer)]
          : q.correctAnswer;
        console.log('Scoring Debug:', { userAns, correctOptionText, match: String(userAns) === String(correctOptionText) });
        if (String(userAns) === String(correctOptionText)) {
          score++;
        }
      });
      const attemptData = {
        userId: user?.uid,
        courseSlug: session.courseSlug,
        score,
        totalQuestions: questions.length,
        answers: finalAnswers,
        startTime: session.startTime,
        endTime: Date.now(),
        duration: Date.now() - session.startTime,
        isRanked: session.isRanked,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'exam_attempts'), attemptData);
      clearSession();

      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(console.error);
      }

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
      alert('Network error during submission. Please try again.');
    }
  }, [clearSession, isSubmitting, navigate, questions, session.courseSlug, session.isRanked, session.startTime, user?.uid]);

  useEffect(() => {
    const totalDuration = 30 * 60 * 1000;
    const elapsed = Date.now() - session.startTime;
    const remaining = Math.max(0, totalDuration - elapsed);
    setTimeLeft(Math.floor(remaining / 1000));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string | number) => {
    const newAnswers = { ...answers, [currentIdx]: option };
    setAnswers(newAnswers);
    updateAnswers(newAnswers);

    if (autoNext && currentIdx < 39) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 300);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentIdx)) {
      newFlagged.delete(currentIdx);
    } else {
      newFlagged.add(currentIdx);
    }
    setFlagged(newFlagged);
  };

  if (loading) return <div>Loading...</div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Lora'] flex flex-col">
      {/* Top Bar */}
      <header className="h-16 md:h-20 bg-white border-b border-[#adb3b4]/20 flex items-center justify-between px-3 md:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="px-2 py-0.5 bg-[#2a2d2e] text-white text-[11px] font-bold rounded-sm uppercase tracking-wider">
            {session.courseSlug}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#b32839]/5 border border-[#b32839]/10 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b32839] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b32839]"></span>
            </span>
            <span className="text-[8px] font-bold text-[#b32839] uppercase tracking-widest whitespace-nowrap">Integrity Shield Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-sm border ${timeLeft < 300 ? 'bg-[#b32839]/5 border-[#b32839]/30 text-[#b32839]' : 'bg-[#f2f4f4] border-[#adb3b4]/10 text-[#2a2d2e]'
            }`}>
            <span className="material-symbols-outlined text-xs">timer</span>
            <span className="text-sm font-bold tabular-nums tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => handleSubmission(answers)}
            disabled={isSubmitting}
            className="px-3 md:px-6 py-2 md:py-2.5 bg-[#b32839] text-white text-[11px] md:text-xs font-bold rounded-sm hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-50"
          >
            {isSubmitting ? 'Finalizing...' : 'Submit'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-6 md:gap-8 max-w-[1550px] mx-auto w-full">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-6 md:p-10 shadow-sm relative">
            <div className="flex flex-row justify-between items-center mb-6 gap-4">
              <span className="text-[11px] font-bold text-[#adb3b4] tracking-wider">Question {currentIdx + 1} of 40</span>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${flagged.has(currentIdx)
                  ? 'bg-[#d4aa37] border-[#d4aa37] text-white'
                  : 'bg-white border-[#adb3b4]/30 text-[#757c7d] hover:border-[#d4aa37]'
                  }`}
              >
                <span className="material-symbols-outlined text-xs">flag</span>
                <span className="text-[11px] font-bold italic">
                  {flagged.has(currentIdx) ? 'Flagged' : 'Flag for Review'}
                </span>
              </button>
            </div>

            <div className="space-y-6 md:space-y-8">
              <h2 className="text-lg md:text-2xl font-bold text-[#2a2d2e] leading-relaxed min-h-[80px]">
                {currentQuestion?.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {currentQuestion?.options?.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 text-left rounded-sm border transition-all flex items-center gap-3 group ${answers[currentIdx] === option
                      ? 'border-[#d4aa37] bg-[#d4aa37]/5'
                      : 'border-[#adb3b4]/10 hover:border-[#d4aa37]/30 hover:bg-[#f9f9f9]'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[9px] font-bold shrink-0 ${answers[currentIdx] === option
                      ? 'bg-[#d4aa37] border-[#d4aa37] text-white'
                      : 'border-[#adb3b4]/20 text-[#757c7d] group-hover:border-[#d4aa37]'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-sm font-medium ${answers[currentIdx] === option ? 'text-[#2a2d2e]' : 'text-[#5a6061]'
                      }`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-[#757c7d] disabled:opacity-20 hover:text-[#2a2d2e] transition-colors"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Prev<span className="hidden sm:inline">Question</span>
            </button>

            <button
              onClick={() => currentIdx === 39 ? handleSubmission(answers) : setCurrentIdx(currentIdx + 1)}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 text-white text-[11px] md:text-xs font-bold rounded-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 ${currentIdx === 39 ? 'bg-[#b32839]' : 'bg-[#2a2d2e]'
                }`}
            >
              {currentIdx === 39 ? (isSubmitting ? 'Saving...' : 'Finalize Session') : (
                <>Next<span className="hidden sm:inline"> Question</span></>
              )}
              <span className="material-symbols-outlined text-xs">
                {currentIdx === 39 ? 'check_circle' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-8 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#2a2d2e] tracking-wider mb-4 flex items-center justify-between">
              Question Map
              <span className="text-[#adb3b4] font-medium italic">{Object.keys(answers).length}/40</span>
            </h3>

            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 40 }).map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCurrent = currentIdx === i;
                const isFlagged = flagged.has(i);

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`aspect-square rounded-sm border text-[8px] font-bold transition-all relative flex items-center justify-center ${isCurrent
                      ? 'border-[#2a2d2e] bg-[#2a2d2e] text-white'
                      : isFlagged
                        ? 'border-[#d4aa37] bg-[#d4aa37] text-white'
                        : isAnswered
                          ? 'border-[#adb3b4]/20 bg-[#f2f4f4] text-[#2a2d2e]'
                          : 'border-[#adb3b4]/20 text-[#adb3b4] hover:border-[#757c7d]'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#2a2d2e] tracking-wide">Auto-Advance</span>
                <span className="text-[9px] text-[#757c7d] italic leading-none mt-1">Selection triggers next question</span>
              </div>
              <button
                onClick={() => setAutoNext(!autoNext)}
                className={`w-8 h-4 rounded-full transition-colors relative ${autoNext ? 'bg-[#d4aa37]' : 'bg-[#adb3b4]/30'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoNext ? 'right-0.5' : 'left-0.5'}`} />
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <div className="relative">
              <div className="w-16 h-16 border-2 border-[#adb3b4]/10 rounded-full"></div>
              <motion.div
                className="absolute inset-0 border-2 border-[#b32839] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-2xl text-[#b32839]">
                security
              </span>
            </div>
            <h2 className="text-sm font-bold text-[#b32839] uppercase tracking-[0.3em] mt-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b32839] animate-pulse"></span>
              Securing Integrity Shield
            </h2>
            <p className="text-[#757c7d] text-[10px] uppercase font-bold tracking-widest mt-2">
              Writing persistent record to global ledger...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPortal;

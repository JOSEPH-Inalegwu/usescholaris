import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ExamSession, useSessionPersistence } from '../../hooks/useSessionPersistence';
import { type Question } from '../../types/question';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, arrayUnion, query, where, limit, getDocs } from 'firebase/firestore';
import { checkAchievements } from '../../lib/utils/achievements';
import QuestionCard from './QuestionCard';

interface ExamPortalProps {
  session: ExamSession;
  initialQuestions?: Question[];
}

const ExamPortal: React.FC<ExamPortalProps> = ({ session, initialQuestions }) => {
  const { updateAnswers, clearSession } = useSessionPersistence();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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
          const cacheKey = `exam_cache_${session.courseSlug.toLowerCase()}`;
          const cachedData = localStorage.getItem(cacheKey);
          let cache = cachedData ? JSON.parse(cachedData) : { questions: [], fetchCount: 0, isFullyCached: false };

          // 1. If fully cached, serve 40 random from local storage (Zero Cost)
          if (cache.isFullyCached && cache.questions.length >= 40) {
            const shuffled = [...cache.questions].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, 40));
            setLoading(false);
            return;
          }

          // 2. Check Daily Read Limit (Only for Firebase fetches)
          const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
          const dailyReadsKey = `exam_daily_reads_${user?.uid}_${today}`;
          const dailyReads = parseInt(localStorage.getItem(dailyReadsKey) || '0');

          if (dailyReads >= 5) {
            setQuestions([]);
            setLoading(false);
            alert("You have used all 5 fetches today. You can still practice fully cached courses. New courses will unlock tomorrow.");
            navigate('/dashboard');
            return;
          }

          // 3. Otherwise, fetch from Firebase
          const questionsCol = collection(db, 'questions');
          const randomVal = Math.random();
          
          const q1 = query(
            questionsCol,
            where('courseSlug', '==', session.courseSlug.toLowerCase()),
            where('randomId', '>=', randomVal),
            limit(40)
          );
          
          const snapshot1 = await getDocs(q1);
          let fetchedDocs = snapshot1.docs.map(d => ({ id: d.id, ...d.data() } as Question));

          if (fetchedDocs.length < 40) {
            const remaining = 40 - fetchedDocs.length;
            const q2 = query(
              questionsCol,
              where('courseSlug', '==', session.courseSlug.toLowerCase()),
              where('randomId', '<', randomVal),
              limit(remaining)
            );
            const snapshot2 = await getDocs(q2);
            const fallbackDocs = snapshot2.docs.map(d => ({ id: d.id, ...d.data() } as Question));
            fetchedDocs = [...fetchedDocs, ...fallbackDocs];
          }

          // 4. Increment Daily Reads counter
          localStorage.setItem(dailyReadsKey, (dailyReads + 1).toString());

          // Update Local Cache
          const existingIds = new Set(cache.questions.map((q: any) => q.id));
          const uniqueNewQuestions = fetchedDocs.filter(q => !existingIds.has(q.id));
          
          const updatedQuestions = [...cache.questions, ...uniqueNewQuestions];
          const newFetchCount = cache.fetchCount + 1;
          
          const updatedCache = {
            questions: updatedQuestions,
            fetchCount: newFetchCount,
            isFullyCached: newFetchCount >= 5 || updatedQuestions.length >= 200,
            lastUpdated: Date.now()
          };

          localStorage.setItem(cacheKey, JSON.stringify(updatedCache));

          // Set questions for the current session
          const shuffled = fetchedDocs.sort(() => 0.5 - Math.random());
          setQuestions(shuffled);
        } catch (err) {
          console.error('Failed to fetch questions:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [initialQuestions, session.courseSlug, user?.uid, navigate]);

  const handleSubmission = useCallback(async (finalAnswers: Record<number, string | number>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let correct = 0;
      let incorrect = 0;
      let skipped = 0;
      const categoryBreakdown: Record<string, { correct: number; total: number }> = {};

      questions.forEach((q, i) => {
        const userAns = finalAnswers[i];
        const category = q.category || 'General';

        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { correct: 0, total: 0 };
        }
        categoryBreakdown[category].total++;

        if (userAns === undefined || userAns === null || userAns === '') {
          skipped++;
          return;
        }

        const correctOptionText = Array.isArray(q.options)
          ? q.options[Number(q.correctAnswer)]
          : q.correctAnswer;

        if (String(userAns) === String(correctOptionText)) {
          correct++;
          categoryBreakdown[category].correct++;
        } else {
          incorrect++;
        }
      });

      const duration = Date.now() - session.startTime;
      const attemptData = {
        userId: user?.uid,
        courseSlug: session.courseSlug,
        score: correct,
        totalQuestions: questions.length,
        answers: finalAnswers,
        startTime: session.startTime,
        endTime: Date.now(),
        duration,
        isRanked: session.isRanked,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'exam_attempts'), attemptData);

      let note = "";
      if (user?.uid) {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const prevDate = profile?.stats?.lastActivityDate;
        const isFullExam = Object.keys(finalAnswers).length === questions.length;

        const pct = (correct / questions.length) * 100;
        if (pct < 50) note = "Good attempt! Let's focus on reviewing the key concepts before jumping back in. You've got this!";
        else if (pct <= 80) note = "Strong performance! You're building solid momentum. A few more rounds and you'll be at the top.";
        else note = "Elite level! You've mastered this course's core. Ready to take on something new?";

        const newAchievements = checkAchievements(profile?.stats || {}, { score: correct, total: questions.length, skipped }, categoryBreakdown);

        let updatePayload: any = {
          'stats.totalPoints': increment(correct),
          'stats.totalQuestions': increment(questions.length),
          'stats.totalTime': increment(duration),
          'stats.totalAttempts': increment(1),
          [`stats.activityLog.${todayStr}`]: increment(questions.length),
          [`stats.courseActivity.${session.courseSlug}`]: increment(questions.length),
          'currentSession': {
            status: 'completed',
            courseName: session.courseSlug.toUpperCase(),
            score: correct,
            total: questions.length,
            postExamNote: note,
            updatedAt: serverTimestamp()
          }
        };

        const existing = profile?.stats?.achievements || [];
        const toAdd = newAchievements.filter(id => !existing.includes(id));
        if (toAdd.length > 0) {
          updatePayload['stats.achievements'] = arrayUnion(...toAdd);
        }

        if (isFullExam) {
          updatePayload['stats.lastActivityDate'] = todayStr;

          if (!prevDate) {
            updatePayload['stats.streakCount'] = 1;
          } else if (prevDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('en-CA');

            if (prevDate === yesterdayStr) {
              updatePayload['stats.streakCount'] = increment(1);
            } else {
              updatePayload['stats.streakCount'] = 1;
            }
          }
        }

        await updateDoc(doc(db, 'users', user.uid), updatePayload);
      }

      clearSession();

      navigate('/results', {
        replace: true,
        state: {
          score: correct,
          total: questions.length,
          courseSlug: session.courseSlug,
          note,
          incorrect,
          skipped,
          duration,
          categoryBreakdown,
          questions,
          answers: finalAnswers
        }
      });
    } catch (err) {
      console.error('Submission failed:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
      }
      setIsSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  }, [clearSession, isSubmitting, navigate, questions, session.courseSlug, session.isRanked, session.startTime, user?.uid, profile?.stats?.lastActivityDate]);

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
    const currentQId = questions[currentIdx].id;
    const newAnswers = { ...answers, [currentQId]: option };
    setAnswers(newAnswers);
    if (autoNext && currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 250);
    }
  };

  const toggleFlag = () => {
    const currentQId = questions[currentIdx].id;
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQId)) newFlagged.delete(currentQId);
    else newFlagged.add(currentQId);
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
  const totalQuestionCount = questions.length || 40; // Fallback to 40 for UI consistency if loading
  const unansweredCount = Math.max(0, totalQuestionCount - answeredCount);
  const progressPct = (answeredCount / totalQuestionCount) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Lora'] flex flex-col">

      {/* Top Bar */}
      <header className="bg-white border-b border-[#adb3b4]/20 sticky top-0 z-10">
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
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
        <main className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-5 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#adb3b4] tracking-widest">Q{currentIdx + 1} <span className="font-normal text-[#adb3b4]/60">/ {totalQuestionCount}</span></span>
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

            <QuestionCard
              question={currentQuestion}
              selectedAnswer={answers[currentIdx]}
              onAnswerSelect={handleAnswerSelect}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-[#757c7d] disabled:opacity-20 hover:text-[#2a2d2e] border border-[#adb3b4]/20 rounded-sm hover:border-[#adb3b4]/40 transition-all disabled:border-transparent"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Previous
            </button>
            <span className="text-[10px] font-bold text-[#adb3b4] md:hidden">{currentIdx + 1} / {totalQuestionCount}</span>
            <button
              onClick={() => currentIdx === totalQuestionCount - 1 ? handleSubmission(answers) : setCurrentIdx(currentIdx + 1)}
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-6 py-3 text-[12px] font-bold text-white rounded-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 ${currentIdx === totalQuestionCount - 1 ? 'bg-[#b32839]' : 'bg-[#2a2d2e]'
                }`}
            >
              {currentIdx === totalQuestionCount - 1 ? (isSubmitting ? 'Saving...' : 'Submit Exam') : 'Next'}
              <span className="material-symbols-outlined text-xs">
                {currentIdx === totalQuestionCount - 1 ? 'check_circle' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </main>

        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-white border border-[#adb3b4]/20 rounded-sm p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-[#2a2d2e] uppercase tracking-wider">Question Map</h3>
              <div className="flex items-center gap-2 text-[10px] text-[#adb3b4]">
                <span className="font-bold text-[#2a2d2e]">{answeredCount}</span>
                <span>/</span>
                <span>{totalQuestionCount}</span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: totalQuestionCount }).map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCurrent = currentIdx === i;
                const isFlagged = flagged.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
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
          </div>
          {unansweredCount > 0 && (
            <div className="bg-[#b32839]/5 border border-[#b32839]/10 rounded-sm px-4 py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#b32839]">warning</span>
              <p className="text-[12px] text-[#b32839] font-bold">
                {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
              </p>
            </div>
          )}
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

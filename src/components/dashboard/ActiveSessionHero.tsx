import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, addDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks';
import { HeroSkeleton } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionData {
  status: 'active' | 'none' | 'completed';
  courseName?: string;
  focusTopic?: string;
  postExamNote?: string;
  startedAt?: any;
  updatedAt?: any;
}

const ActiveSessionHero: React.FC = () => {
  const { user, profile } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('60:00');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSession(data.currentSession || { status: 'none' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (session?.status === 'active' && session.startedAt) {
      const interval = setInterval(() => {
        const startTime = session.startedAt.toDate().getTime();
        const now = new Date().getTime();
        const duration = 60 * 60 * 1000;
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const startSession = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      currentSession: {
        status: 'active',
        courseName: profile?.department || 'General Studies',
        focusTopic: 'Core Academic Modules',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    });
  };

  const completeSession = async () => {
    if (!user || !session?.startedAt) return;

    try {
      // Calculate actual duration in minutes
      const startTime = session.startedAt.toDate().getTime();
      const now = new Date().getTime();
      const durationMs = now - startTime;
      const durationMinutes = Math.floor(durationMs / 60000);

      // Only record if duration is > 1 minute
      if (durationMinutes >= 1) {
        const durationHours = durationMinutes / 60;

        // 1. Add session record to subcollection
        await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          completedAt: serverTimestamp(),
          courseName: session?.courseName || 'General Studies',
          durationMinutes,
          postExamNote: `Excellent work session for ${session?.courseName || 'your course'}. Ensure you review the key concepts before your next exam.`
        });

        // 2. Clear current session state and increment total study hours
        await updateDoc(doc(db, 'users', user.uid), {
          currentSession: {
            status: 'completed',
            courseName: session?.courseName,
            postExamNote: `Excellent work session for ${session?.courseName || 'your course'}. Ensure you review the key concepts before your next exam.`,
            updatedAt: serverTimestamp()
          },
          totalStudyHours: increment(durationHours)
        });
      } else {
        // Clear the session if it was too short (ghost session)
        await updateDoc(doc(db, 'users', user.uid), {
          currentSession: {
            status: 'none',
            updatedAt: serverTimestamp()
          }
        });
        console.log('[ActiveSessionHero] Ghost session discarded (< 1 min)');
      }
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  if (loading) return <HeroSkeleton />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={session?.status || 'none'}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {(!session || session.status === 'none') && (
          <section className="rounded-xl bg-[#ebeeef] text-[#5a6061] p-6 lg:p-10 min-h-[320px] flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-extrabold mb-4 font-['Lora'] text-[#2d3435]">No Active Study Session</h2>
            <p className="mb-8 max-w-sm">Track your progress for {profile?.department || 'your studies'}.</p>
            <button onClick={startSession} className="bg-[#2d3435] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#b32839] transition-all">Start New Session</button>
          </section>
        )}

        {session?.status === 'completed' && (
          <section className="rounded-xl bg-[#5f5e5e] text-white p-6 lg:p-10 min-h-[320px] flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-extrabold mb-4 font-['Lora']">Session Summary</h2>
              <p className="text-white/80">Great work! You've completed your study block.</p>
              {session.postExamNote && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm font-bold">Feedback:</p>
                  <p className="text-xs mt-1">{session.postExamNote}</p>
                </div>
              )}
            </div>
            <button onClick={startSession} className="mt-6 bg-white text-[#5f5e5e] px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#b32839] hover:text-white transition-all self-start">Start New Session</button>
          </section>
        )}

        {session?.status === 'active' && (
          <section className="relative overflow-hidden rounded-xl bg-[#5f5e5e] text-white p-6 lg:p-10 min-h-[320px] flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#b32839]/20 rounded-full text-[10px] font-bold tracking-[0.2em] text-white uppercase border border-[#b32839]/30 mb-6 font-['Lora']">
                  <span className="w-1.5 h-1.5 bg-[#b32839] rounded-full animate-pulse" /> Active
                </span>
                <span className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white">Rank: Tier A</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tighter mb-4 max-w-lg leading-tight font-['Lora']">Focus: {session.focusTopic}</h2>
              <p className="text-white/70 text-sm max-w-md leading-relaxed">Course: {session.courseName}. Keep up the great pace.</p>
            </div>
            <div className="relative z-10 flex flex-wrap items-center gap-8 mt-8">
              <div><p className="text-[10px] uppercase tracking-widest text-white/50 mb-1 font-['Lora']">Time Remaining</p><p className="text-3xl font-light tracking-widest font-['Lora']">{timeLeft}</p></div>
              <div className="hidden sm:block h-10 w-px bg-white/20" />
              <button onClick={completeSession} className="bg-white text-[#5f5e5e] px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#b32839] hover:text-white transition-all active:scale-95 shadow-xl font-['Lora']">Finish Session</button>
            </div>
          </section>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveSessionHero;

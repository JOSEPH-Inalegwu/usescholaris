import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks';
import { HeroSkeleton } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SessionData {
  status: 'active' | 'none' | 'completed';
  courseName?: string;
  focusTopic?: string;
  postExamNote?: string;
  score?: number;
  total?: number;
  startedAt?: any;
  updatedAt?: any;
}

const ActiveSessionHero: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [suggestedCourse, setSuggestedCourse] = useState<{ slug: string; name: string } | null>(null);

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

  // Logic to find suggested course
  useEffect(() => {
    const fetchAndSuggest = async () => {
      try {
        const snap = await getDocs(collection(db, 'course_banks'));
        const allCourses = snap.docs.map(d => {
          const data = d.data();
          return {
            slug: data.courseSlug || d.id.split('_')[2],
            level: data.level || '200',
            dept: data.dept || 'CS'
          };
        });

        // Filter by user level
        const userLevel = profile?.level?.replace(/\s+level/i, '').trim();

        let filtered = allCourses.filter(c => c.level === userLevel);
        if (filtered.length === 0) filtered = allCourses;

        const activity = profile?.stats?.courseActivity || {};
        const sorted = filtered.sort((a, b) => {
          const countA = activity[a.slug] || 0;
          const countB = activity[b.slug] || 0;
          return countA - countB;
        });

        if (sorted[0]) {
          setSuggestedCourse({
            slug: sorted[0].slug,
            name: sorted[0].slug.toUpperCase()
          });
        }
      } catch (err) {
        console.error('Error in suggestion logic:', err);
      }
    };

    if (!loading && profile && (session?.status === 'none' || !session)) {
      fetchAndSuggest();
    }
  }, [loading, profile, session?.status]);

  useEffect(() => {
    if (session?.status === 'active' && session.startedAt) {
      const interval = setInterval(() => {
        const startTime = session.startedAt.toDate().getTime();
        const now = new Date().getTime();
        const duration = 30 * 60 * 1000; // 30 mins standard exam
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleStartExam = () => {
    if (session?.status === 'active' && session.courseName) {
      navigate(`/exam/${session.courseName.toLowerCase()}`);
    } else if (suggestedCourse) {
      navigate(`/exam/${suggestedCourse.slug}`);
    } else {
      navigate('/questions');
    }
  };

  if (loading) return <HeroSkeleton />;

  const pulseAnim = {
    scale: [1, 1.02, 1],
    opacity: [1, 0.9, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
  };

  const glintAnim = {
    x: ['-100%', '100%'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear" as const,
      repeatDelay: 4
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        key={session?.status || 'loading'}
      >
        {/* State 1: Active Session (Locked & Live) */}
        {session?.status === 'active' && (
          <section className="rounded-xl bg-[#0a0a0a] text-white p-6 lg:p-10 min-h-[300px] flex flex-col justify-between border border-white/10 shadow-2xl overflow-hidden relative transition-all">
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ 
                backgroundImage: `url('/session-img.jpg')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
              }}
            />
            {/* Sophisticated Overlay: Radial gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/80 z-[1]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b32839]/20 rounded-full blur-[100px] -mr-32 -mt-32 z-[2]" />

            {/* Glass Glint Effect - Automatic */}
            <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
              <motion.div 
                animate={glintAnim}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#b32839]/40 backdrop-blur-md rounded-full text-[10px] font-bold tracking-[0.2em] text-[#ff4d4d] uppercase border border-[#b32839]/50 font-['Lora']">
                  <span className="w-1.5 h-1.5 bg-[#b32839] rounded-full animate-ping" /> Live Exam
                </span>
                <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Session Locked</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-['Lora'] text-white drop-shadow-md">
                Currently taking {session.courseName}
              </h2>
              <p className="text-white/60 text-sm font-medium">Your progress is being synced to the Scholaris cloud.</p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 border-t border-white/10 pt-8">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Time Left</p>
                  <p className="text-3xl font-light tabular-nums tracking-wider text-white">{timeLeft}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Type</p>
                  <p className="text-sm font-bold text-[#d4aa37]">Ranked Session</p>
                </div>
              </div>
              <button
                onClick={handleStartExam}
                className="bg-white text-[#2a2d2e] px-8 py-3 rounded-sm font-bold text-[12px] uppercase tracking-[0.1em] hover:bg-[#b32839] hover:text-white transition-all active:scale-95 shadow-lg"
              >
                Return to Exam
              </button>
            </div>
          </section>
        )}

        {/* State 2: Completed (Post-Exam Feedback) */}
        {session?.status === 'completed' && (
          <section className="rounded-xl bg-[#0a0a0a] p-6 lg:p-10 min-h-[300px] flex flex-col justify-between border border-white/10 shadow-sm relative transition-all overflow-hidden">
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ backgroundImage: `url('/session-img.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/80 z-[1]" />
            
            {/* Glass Glint Effect - Automatic */}
            <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
              <motion.div 
                animate={glintAnim}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-[#d4aa37]/20 backdrop-blur-md rounded-full text-[10px] font-bold text-[#d4aa37] uppercase tracking-widest border border-[#d4aa37]/30">
                  Last Result: {session.score}/{session.total}
                </div>
                <div className="text-[24px] font-black text-white">
                  {Math.round((session.score || 0) / (session.total || 1) * 100)}%
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-4 font-['Lora'] leading-tight">
                {session.courseName} Completed
              </h2>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-sm border-l-4 border-[#b32839]">
                <p className="text-xs uppercase font-bold text-white/40 mb-2 tracking-widest italic">Scholaris Note</p>
                <p className="text-sm text-white/90 leading-relaxed font-medium">"{session.postExamNote}"</p>
              </div>
            </div>
            <button
              onClick={handleStartExam}
              className="relative z-10 mt-8 bg-[#b32839] text-white px-8 py-4 rounded-sm font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-white hover:text-[#2a2d2e] transition-all self-start shadow-xl active:scale-95"
            >
              Start Another Session
            </button>
          </section>
        )}

        {/* State 3: Ready (Dynamic Suggestion Launcher) */}
        {(session?.status === 'none' || !session) && (
          <section className="rounded-xl bg-[#0a0a0a] p-6 lg:p-10 min-h-[300px] flex flex-col justify-between border border-white/10 shadow-sm transition-all relative overflow-hidden">
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ backgroundImage: `url('/session-img.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/40 to-black/80 z-[1]" />

            {/* Glass Glint Effect - Automatic */}
            <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
              <motion.div 
                animate={glintAnim}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Ready to Start?</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-3 font-['Lora'] tracking-tighter">
                Next up: {suggestedCourse?.name || 'Your Core Studies'}
              </h2>
              <p className="text-white/60 text-sm max-w-md leading-relaxed font-medium">
                Recommended based on your activity logic. Answer 40 questions today to maintain your streak health.
              </p>
            </div>
            <motion.button
              animate={pulseAnim}
              whileHover={{ scale: 1.05 }}
              onClick={handleStartExam}
              className="relative z-10 mt-8 bg-white text-[#2a2d2e] px-10 py-4 rounded-sm font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-[#b32839] hover:text-white transition-all self-start shadow-xl active:scale-95"
            >
              Begin Session
            </motion.button>
          </section>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveSessionHero;

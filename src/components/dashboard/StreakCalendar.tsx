import React, { useState, useEffect, useMemo } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebase';
import { useAuth } from '../../hooks';
const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff' };

interface SessionRecord {
  id: string;
  date: string;
  completedAt: any;
}

const StreakCalendar: React.FC = () => {
  const { user } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen to sessions subcollection
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('completedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history: SessionRecord[] = [];
      const sessionDates: Record<string, number> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.completedAt?.toDate().toISOString().split('T')[0];
        if (date) {
          history.push({ id: doc.id, date, completedAt: data.completedAt });
          sessionDates[date] = (sessionDates[date] || 0) + 1;
        }
      });

      // Calculate Streak
      let currentStreak = 0;
      let d = new Date();
      while (true) {
        const dateStr = d.toISOString().split('T')[0];
        if (sessionDates[dateStr]) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }

      setSessionHistory(history);
      setStreak(currentStreak);
    });

    return () => unsubscribe();
  }, [user]);

  // UI Helpers
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#ebeeef]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a6061] font-['Lora']">Focus Streaks</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${goldPalette.primary}20` }}>
          <span className="material-symbols-outlined text-xs animate-pulse" style={{ color: goldPalette.primary, fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-[10px] font-bold" style={{ color: goldPalette.dark }}>{streak} Days</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dateStr) => {
          const count = sessionHistory.filter(s => s.date === dateStr).length;
          const opacity = Math.min(count * 0.3, 1);
          return (
            <div
              key={dateStr}
              className="aspect-square rounded-sm transition-all duration-300"
              style={{ background: count > 0 ? `rgba(212, 175, 55, ${opacity})` : '#ebeeef' }}
            />
          );
        })}
      </div>

      {streak === 0 && (
        <p className="mt-4 text-[10px] text-red-500 text-center font-bold">Streak broken! Start a session today.</p>
      )}
    </div>
  );
};

export default StreakCalendar;

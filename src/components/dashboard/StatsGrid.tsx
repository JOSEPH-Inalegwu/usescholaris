import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { db } from '../../lib/firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, limit, where } from 'firebase/firestore';
import { motion } from 'framer-motion';

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff', accent: '#b32839' };

interface SessionRecord {
    id: string;
    courseName: string;
    completedAt: any;
    durationMinutes?: number;
}

const AnimatedNumber: React.FC<{ value: number | string; suffix?: string; decimals?: number }> = ({ value, suffix = '', decimals = 0 }) => {
    const displayValue = typeof value === 'number'
        ? value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : value;

    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={displayValue}
            className="text-2xl lg:text-3xl font-black text-[#2d3435] font-['Lora']"
        >
            {displayValue}{suffix}
        </motion.span>
    );
};

const StatsGrid: React.FC = () => {
    const { user, profile } = useAuth();
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [cohort, setCohort] = useState<any[]>([]);
    const [userDocData, setUserDocData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // 1. Sessions Listener (Current User Only)
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const qSessions = query(sessionsRef, orderBy('completedAt', 'desc'), limit(100));

        const unsubscribeSessions = onSnapshot(qSessions, (snapshot) => {
            const sessionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionRecord));
            setSessions(sessionData);
        });

        // 2. User Data Listener
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserDocData(docSnap.data());
            }
        });

        return () => {
            unsubscribeSessions();
            unsubscribeUser();
        };
    }, [user]);

    // 3. Cohort Listener (Active Query)
    useEffect(() => {
        if (!user || !profile?.department || !profile?.level) return;

        const cohortQuery = query(
            collection(db, 'users'),
            where('department', '==', profile.department),
            where('level', '==', profile.level)
        );

        const unsubscribeCohort = onSnapshot(cohortQuery, (snapshot) => {
            const members = snapshot.docs.map(doc => ({
                uid: doc.id,
                totalStudyHours: doc.data().totalStudyHours || 0,
                ...doc.data()
            }));
            setCohort(members);
            setIsLoading(false);
        });

        return () => unsubscribeCohort();
    }, [user, profile?.department, profile?.level]);

    // Aggregations
    const derivedStats = useMemo(() => {
        // totalHours aggregated from sessions
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const totalHours = totalMinutes / 60;

        // Rank derived by sorting cohort by totalStudyHours
        const sortedCohort = [...cohort].map(member => {
            if (member.uid === user?.uid) {
                return { ...member, totalStudyHours: totalHours };
            }
            return member;
        }).sort((a, b) => b.totalStudyHours - a.totalStudyHours);

        const myIndex = sortedCohort.findIndex(m => m.uid === user?.uid);
        const rank = myIndex !== -1 ? myIndex + 1 : 0;
        const totalStudents = cohort.length;

        // Weekly Growth
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentWeekMins = sessions.filter(s => s.completedAt?.toDate() > oneWeekAgo)
            .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const lastWeekMins = sessions.filter(s => {
            const d = s.completedAt?.toDate();
            return d <= oneWeekAgo && d > twoWeeksAgo;
        }).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

        let growth = 0;
        if (lastWeekMins > 0) growth = Math.round(((currentWeekMins - lastWeekMins) / lastWeekMins) * 100);
        else if (currentWeekMins > 0) growth = 100;

        const distribution: Record<string, number> = {};
        sessions.forEach(s => { if (s.courseName) distribution[s.courseName] = (distribution[s.courseName] || 0) + 1; });

        return {
            totalHours,
            totalMinutes,
            rank,
            totalStudents,
            growth,
            distribution,
            avgScore: userDocData?.avgScore || 0,
            questionsAnswered: userDocData?.questionsAnswered || 0,
            accuracy: userDocData?.accuracy || 0
        };
    }, [sessions, cohort, user?.uid, userDocData]);

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg tracking-tight font-['Lora'] text-[#2d3435]">Cohort Analysis</h3>
                <Link to="/leaderboard" className="text-[10px] font-bold text-[#b32839] uppercase tracking-widest hover:underline font-['Lora']">Global Standings</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Derived Rank Card */}
                <motion.div whileHover={{ y: -5 }} className="bg-[#b32839]/5 border border-[#b32839]/10 rounded-xl p-5 relative overflow-hidden group transition-all">
                    <p className="text-[10px] font-bold text-[#b32839] uppercase mb-3 font-['Lora'] tracking-widest">Dept. Rank</p>
                    <div className="flex items-baseline gap-1 mb-1">
                        <AnimatedNumber value={derivedStats.rank || '--'} />
                        <span className="text-xs text-[#5a6061] font-medium">/ {derivedStats.totalStudents || '--'}</span>
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora'] truncate">{profile?.department || '--'}</p>
                    <div className="mt-4 h-1 w-full bg-[#b32839]/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${derivedStats.totalStudents ? Math.max(5, 100 - (derivedStats.rank / derivedStats.totalStudents * 100)) : 0}%` }}
                            className="h-full bg-[#b32839]"
                        />
                    </div>
                </motion.div>

                {/* Aggregated Study Hours Card */}
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Study Time</p>
                    <div className="flex items-baseline gap-1 mb-1">
                        {derivedStats.totalHours < 1 ? (
                            <>
                                <AnimatedNumber value={derivedStats.totalMinutes} />
                                <span className="text-xs text-[#5a6061] font-medium">mins</span>
                            </>
                        ) : (
                            <>
                                <AnimatedNumber value={derivedStats.totalHours} decimals={1} />
                                <span className="text-xs text-[#5a6061] font-medium">Hrs</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold ${derivedStats.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {derivedStats.growth > 0 ? '+' : ''}{derivedStats.growth}%
                        </span>
                        <p className="text-[11px] text-[#adb3b4] font-medium font-['Lora']">vs last week</p>
                    </div>
                    <div className="mt-3 flex gap-0.5">
                        {sessions.length > 0 ? (
                            Object.entries(derivedStats.distribution).slice(0, 4).map(([course, count], idx) => (
                                <div key={course} title={`${course}: ${count} sessions`} className="h-1 rounded-full transition-all flex-1" style={{ backgroundColor: idx % 2 === 0 ? goldPalette.primary : goldPalette.dark }} />
                            ))
                        ) : <div className="h-1 bg-[#f2f4f4] rounded-full w-full" />}
                    </div>
                </motion.div>

                {/* Real Avg Score Card */}
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Avg. Score</p>
                    <div className="flex items-baseline gap-1 mb-1">
                        <AnimatedNumber value={derivedStats.avgScore || '--'} suffix={derivedStats.avgScore ? '%' : ''} />
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora'] truncate">{profile?.level || '--'}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full border-2 border-white bg-[#f2f4f4] flex items-center justify-center text-[8px] font-bold text-[#5a6061]">{String.fromCharCode(64 + i)}</div>)}
                        </div>
                        <span className="text-[9px] text-[#adb3b4] font-medium uppercase tracking-tighter">Cohort Avg</span>
                    </div>
                </motion.div>

                {/* Accuracy & Total Questions Card */}
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Accuracy</p>
                    <div className="flex items-baseline gap-1 mb-1">
                        <AnimatedNumber value={derivedStats.accuracy || '--'} suffix={derivedStats.accuracy ? '%' : ''} />
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">{derivedStats.questionsAnswered || 0} Questions</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="w-full h-1 bg-[#f2f4f4] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${derivedStats.accuracy || 0}%` }} className="h-full bg-green-500" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsGrid;
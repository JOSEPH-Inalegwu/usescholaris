import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { motion } from 'framer-motion';

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff' };

const AnimatedNumber: React.FC<{ value: number | string; suffix?: string; decimals?: number }> = ({ value, suffix = '', decimals = 0 }) => {
    const displayValue = typeof value === 'number'
        ? value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : value;
    return (
        <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={String(displayValue)}
            className="text-2xl lg:text-3xl font-black text-[#2d3435] font-['Lora']"
        >
            {displayValue}{suffix}
        </motion.span>
    );
};

const StatsGrid: React.FC = () => {
    const { profile } = useAuth();
    const {
        accuracy, avgScore, studyTimeMins,
        semesterProgress, semesterTarget,
        questionsAnswered, totalAttempts, loading
    } = useDashboardStats();

    const fmt = (v: number | string) => loading ? '--' : v;
    const studyLabel = studyTimeMins === 1 ? 'min' : 'mins';

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg tracking-tight font-['Lora'] text-[#2d3435]">Performance Stats</h3>
                <Link to="/leaderboard" className="text-[10px] font-bold text-[#b32839] uppercase tracking-widest hover:underline font-['Lora']">
                    Global Standings
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Accuracy */}
                <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Accuracy</p>
                    <div className="flex items-baseline gap-1 mb-2">
                        <AnimatedNumber value={fmt(accuracy)} decimals={accuracy % 1 !== 0 ? 1 : 0} />
                        {!loading && totalAttempts > 0 && <span className="text-xs text-[#5a6061] font-medium">%</span>}
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">
                        {loading ? '--' : questionsAnswered} questions attempted
                    </p>
                    <div className="mt-4 h-1 w-full bg-[#f2f4f4] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy || 0}%` }}
                            className="h-full bg-green-500 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Avg Score */}
                <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Avg. Score</p>
                    <div className="flex items-baseline gap-1 mb-2">
                        <AnimatedNumber value={fmt(avgScore)} decimals={avgScore % 1 !== 0 ? 1 : 0} />
                        {!loading && totalAttempts > 0 && <span className="text-xs text-[#5a6061] font-medium">/ 40</span>}
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">
                        {loading ? '--' : totalAttempts} exam{totalAttempts !== 1 ? 's' : ''} taken
                    </p>
                    <div className="mt-4 h-1 w-full bg-[#f2f4f4] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalAttempts > 0 ? (avgScore / 40) * 100 : 0}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: goldPalette.primary }}
                        />
                    </div>
                </motion.div>

                {/* Study Time */}
                <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl p-5 border border-transparent shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora'] tracking-widest">Study Time</p>
                    <div className="flex items-baseline gap-1 mb-2">
                        <AnimatedNumber value={fmt(studyTimeMins)} />
                        {!loading && <span className="text-xs text-[#5a6061] font-medium">{studyLabel}</span>}
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">
                        {loading ? '--' : profile?.level || 'Current level'}
                    </p>
                    <div className="mt-3 flex gap-0.5">
                        {totalAttempts > 0 ? (
                            Array.from({ length: Math.min(totalAttempts, 6) }).map((_, i) => (
                                <div key={i} className="h-1 rounded-full flex-1"
                                    style={{ backgroundColor: i % 2 === 0 ? goldPalette.primary : goldPalette.dark }} />
                            ))
                        ) : <div className="h-1 bg-[#f2f4f4] rounded-full w-full" />}
                    </div>
                </motion.div>

                {/* Semester Progress */}
                <motion.div whileHover={{ y: -4 }} className="bg-[#b32839]/5 border border-[#b32839]/10 rounded-xl p-5 transition-all">
                    <p className="text-[10px] font-bold text-[#b32839] uppercase mb-3 font-['Lora'] tracking-widest">Semester Progress</p>
                    <div className="flex items-baseline gap-1 mb-2">
                        <AnimatedNumber value={fmt(semesterProgress)} decimals={semesterProgress % 1 !== 0 ? 1 : 0} />
                        {!loading && <span className="text-xs text-[#b32839]/70 font-medium">%</span>}
                    </div>
                    <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">
                        {loading ? '--' : questionsAnswered} / {semesterTarget} questions
                    </p>
                    <div className="mt-4 h-1 w-full bg-[#b32839]/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${semesterProgress || 0}%` }}
                            className="h-full bg-[#b32839] rounded-full"
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default StatsGrid;
import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const GlobalPerformance: React.FC = () => {
  const { globalMastery, totalAttempts, loading } = useDashboardStats();

  // SVG ring: circumference of r=70 circle = 2π*70 ≈ 440
  const CIRCUMFERENCE = 440;
  const strokeOffset = CIRCUMFERENCE - (CIRCUMFERENCE * (globalMastery / 100));

  return (
    <div className="bg-white p-8 rounded-xl border border-transparent shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5a6061] mb-6 font-['Lora']">Global Performance</h3>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle className="text-[#ebeeef]" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="6" />
            <circle
              className="text-[#b32839] transition-all duration-700"
              cx="80" cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={loading ? CIRCUMFERENCE : strokeOffset}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#2d3435] font-['Lora']">
              {loading ? '--' : `${globalMastery}%`}
            </span>
            <span className="text-[10px] font-bold text-[#5a6061] uppercase tracking-widest font-['Lora']">Mastery</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#ebeeef]">
        <div className="text-center">
          <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-1 font-['Lora']">Exams Taken</p>
          <div className="flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[#b32839] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
            <span className="font-bold text-[#2d3435] font-['Lora']">{loading ? '--' : totalAttempts}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-1 font-['Lora']">Elite Badges</p>
          <div className="flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[#5f5e5e] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="font-bold text-[#2d3435] font-['Lora']">04</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPerformance;

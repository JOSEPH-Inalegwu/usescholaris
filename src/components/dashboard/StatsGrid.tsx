import React from 'react';
import { Link } from 'react-router-dom';

const StatsGrid: React.FC = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg tracking-tight font-['Lora']">Departmental Standing</h3>
        <Link to="/leaderboard" className="text-[10px] font-bold text-[#b32839] uppercase tracking-widest hover:underline font-['Lora']">View Global Leaderboard</Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <div className="min-w-[200px] bg-[#b32839]/5 border border-[#b32839]/20 rounded-xl p-5 relative overflow-hidden">
          <p className="text-[10px] font-bold text-[#b32839] uppercase mb-3 font-['Lora']">Your Rank</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-black text-[#2d3435] font-['Lora']">14</span>
            <span className="text-xs text-[#5a6061] font-medium">/ 420</span>
          </div>
          <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">Computer Science</p>
        </div>
        <div className="min-w-[200px] bg-white rounded-xl p-5 border border-transparent hover:border-[#adb3b4]/30 transition-all">
          <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora']">Avg. Score</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-black text-[#2d3435] font-['Lora']">92</span>
            <span className="text-xs text-[#5a6061] font-medium">%</span>
          </div>
          <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">Cohort A-12</p>
        </div>
        <div className="min-w-[200px] bg-white rounded-xl p-5 border border-transparent hover:border-[#adb3b4]/30 transition-all">
          <p className="text-[10px] font-bold text-[#5a6061] uppercase mb-3 font-['Lora']">Questions Answered</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-black text-[#2d3435] font-['Lora']">158</span>
            <span className="text-xs text-[#5a6061] font-medium">Total</span>
          </div>
          <p className="text-[11px] text-[#5a6061] font-medium font-['Lora']">Verified Solutions</p>
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;

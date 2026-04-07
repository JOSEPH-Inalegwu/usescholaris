import React from 'react';
import { Link } from 'react-router-dom';

const ActiveSessionHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#5f5e5e] text-white p-10 min-h-[320px] flex flex-col justify-between">
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#b32839]/20 rounded-full text-[10px] font-bold tracking-[0.2em] text-white uppercase border border-[#b32839]/30 mb-6 font-['Lora']">
          <span className="w-1.5 h-1.5 bg-[#b32839] rounded-full animate-pulse" />
          Active Session
        </span>
        <h2 className="text-4xl font-extrabold tracking-tighter mb-4 max-w-lg leading-tight font-['Lora']">
          Current Focus: Data Structures & Algorithms
        </h2>
        <p className="text-white/70 text-sm max-w-md leading-relaxed">
          Deep dive into Binary Search Trees and Complexity Analysis. You are currently in the top 5% of this module.
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-8 mt-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1 font-['Lora']">Time Remaining</p>
          <p className="text-3xl font-light tracking-widest font-['Lora']">42:18</p>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <Link
          to="/questions"
          className="bg-white text-[#5f5e5e] px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#b32839] hover:text-white transition-all active:scale-95 shadow-xl font-['Lora']"
        >
          Resume Session
        </Link>
      </div>
    </section>
  );
};

export default ActiveSessionHero;

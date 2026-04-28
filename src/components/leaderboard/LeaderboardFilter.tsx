import React from 'react';
import type { LeaderboardFilterType as LeaderboardFilter } from '../../types/leaderboard';
import { motion } from 'framer-motion';

interface FilterOption {
  key: LeaderboardFilter;
  label: string;
}

interface LeaderboardFilterProps {
  currentFilter: LeaderboardFilter;
  onFilterChange: (filter: LeaderboardFilter) => void;
  activeLabel?: string;
}

const filters: FilterOption[] = [
  { key: 'all', label: 'Global' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'department', label: 'Department' },
  { key: 'level', label: 'Level' },
];

const LeaderboardFilters: React.FC<LeaderboardFilterProps> = ({ currentFilter, onFilterChange, activeLabel }) => {
  return (
    <div className="mb-12">
      {activeLabel && currentFilter !== 'all' && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a6061] bg-[#2d3435]/5 px-4 py-2 rounded-full border border-black/5">
            <span className="material-symbols-outlined text-[12px]">group</span>
            {activeLabel}
          </span>
        </div>
      )}
      <div className="inline-flex items-center p-1 bg-black/5 rounded-2xl border border-black/5 relative">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 font-['Lora'] z-10 ${
              isActive ? 'text-[#b32839]' : 'text-[#5a6061] hover:text-[#2d3435]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl z-[-1]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {filter.label}
          </button>
        );
      })}
      </div>
    </div>
  );
};

export default LeaderboardFilters;

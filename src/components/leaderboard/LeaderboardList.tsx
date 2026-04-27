import React from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../../types/leaderboard';
import { Avatar } from '../ui';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ entries, currentUserId }) => {
  return (
    <div className="space-y-3 pb-32">
      {entries.map((entry, index) => (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
          key={entry.userId}
          className={`group flex items-center gap-3 p-4 rounded-xl transition-all relative ${
            entry.userId === currentUserId
              ? 'bg-[#b32839] shadow-lg'
              : 'bg-white hover:bg-[#f9f9f9] border border-black/5 hover:border-[#d4aa37]/30'
          }`}
        >
          {/* Rank Column */}
          <div className="w-8 flex flex-col items-center justify-center border-r border-black/5 pr-3">
            <span className={`text-[14px] font-black font-['Lora'] ${
              entry.userId === currentUserId ? 'text-white' : 'text-[#2d3435]'
            }`}>
              {entry.rank}
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0 px-1">
            <Avatar 
              photoURL={entry.photoURL} 
              displayName={entry.displayName} 
              size="sm" 
              className={entry.userId === currentUserId ? 'ring-2 ring-white/20' : ''}
            />
            <div className="flex-1 min-w-0">
              <h4 className={`font-black text-sm truncate font-['Lora'] tracking-tight ${
                entry.userId === currentUserId ? 'text-white' : 'text-[#2d3435]'
              }`}>
                {entry.displayName}
              </h4>
<p className={`text-[9px] font-bold uppercase tracking-widest truncate ${
                  entry.userId === currentUserId ? 'text-white/70' : 'text-[#5a6061]'
                }`}>
                  {entry.level} Level • {entry.department}
                </p>
            </div>
          </div>

          {/* Stats Column */}
          <div className="flex items-center gap-4 pl-2">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] font-bold text-[#5a6061] uppercase tracking-wide">Accuracy</p>
                <p className={`text-[12px] font-black font-['Lora'] leading-none ${
                  entry.userId === currentUserId ? 'text-white' : 'text-[#2d3435]'
                }`}>{entry.accuracy}%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-[#5a6061] uppercase tracking-wide">Exams</p>
                <p className={`text-[12px] font-black font-['Lora'] leading-none ${
                  entry.userId === currentUserId ? 'text-white' : 'text-[#2d3435]'
                }`}>{entry.examsTaken}</p>
              </div>
            </div>
            <div className="text-right border-l border-black/10 pl-4">
              <p className="text-[9px] font-bold text-[#5a6061] uppercase tracking-wide">Last 5 Avg</p>
              <p className={`text-[13px] font-black font-['Lora'] leading-none ${
                entry.userId === currentUserId ? 'text-[#d4aa37]' : 'text-[#b32839]'
              }`}>{entry.last5Avg}%</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LeaderboardList;

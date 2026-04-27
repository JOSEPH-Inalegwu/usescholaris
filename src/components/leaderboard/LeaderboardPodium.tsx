import React from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../../types/leaderboard';
import { Avatar } from '../ui';

interface PodiumStepProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
}

const PodiumStep: React.FC<PodiumStepProps> = ({ entry, rank }) => {
  const isFirst = rank === 1;
  const config = {
    1: { color: '#d4aa37', label: '1st', icon: 'crown' },
    2: { color: '#95a5a6', label: '2nd', icon: 'workspace_premium' },
    3: { color: '#cd7f32', label: '3rd', icon: 'military_tech' },
  }[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative flex flex-col items-center flex-1 group`}
      style={{ zIndex: isFirst ? 10 : 1 }}
    >
      <div className="relative mb-4">
        <Avatar 
          photoURL={entry.photoURL} 
          displayName={entry.displayName} 
          size={isFirst ? 'xl' : 'lg'} 
          border={isFirst ? 'border-[#d4aa37]' : 'border-white/50'}
          className="shadow-lg"
        />
        <div 
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white"
          style={{ backgroundColor: config.color }}
        >
          <span className="material-symbols-outlined text-white text-[12px] font-bold">
            {config.icon}
          </span>
        </div>
      </div>

      <div className="text-center px-1">
        <h3 className={`font-black text-[#2d3435] leading-tight font-['Lora'] mb-1 truncate max-w-[100px] ${isFirst ? 'text-sm' : 'text-xs'}`}>
          {entry.displayName}
        </h3>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full border border-black/5">
          <span className="text-[10px] font-black text-[#b32839]">{entry.last5Avg}%</span>
        </div>
      </div>

      {/* Simplified Step */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isFirst ? 100 : rank === 2 ? 80 : 60 }}
        className="w-full max-w-[80px] mt-4 relative"
      >
        <div 
          className="absolute inset-0 rounded-t-xl border-t border-x border-black/5"
          style={{ 
            backgroundColor: config.color,
            opacity: 0.1
          }} 
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="text-3xl font-black font-['Lora']">
            {rank}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
}

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ topThree }) => {
  const podiumOrder = [
    topThree[1] || null,
    topThree[0] || null,
    topThree[2] || null,
  ];

  return (
    <div className="flex items-end justify-center gap-2 mb-8 mt-8 px-2 min-h-[250px]">
      {podiumOrder.map((entry, index) => {
        const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
        if (!entry) return <div key={index} className="flex-1 invisible" />;
        return <PodiumStep key={entry.userId} entry={entry} rank={rank as 1|2|3} />;
      })}
    </div>
  );
};

export default LeaderboardPodium;

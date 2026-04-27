import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks';
import { Avatar } from '../ui';

interface LeaderboardUserRankProps {
  rank: number | null;
  userStats?: { accuracy: number; examsTaken: number; last5Avg: number; questionsAttempted: number } | null;
}

const LeaderboardUserRank: React.FC<LeaderboardUserRankProps> = ({ rank, userStats }) => {
  const { profile, user } = useAuth();

  if (rank === null) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 pointer-events-none flex justify-center z-50 px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 1 }}
        className="pointer-events-auto bg-[#2d3435]/95 backdrop-blur-xl text-white px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-8 max-w-2xl w-full"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              photoURL={user?.photoURL} 
              displayName={profile?.name || user?.displayName} 
              size="lg" 
              className="ring-2 ring-[#d4aa37] shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#d4aa37] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#2d3435]">
              #{rank}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-['Lora']">Your Standing</p>
            <h4 className="font-black text-sm font-['Lora'] tracking-tight whitespace-nowrap">
              {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0]}
            </h4>
          </div>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex-1 flex justify-around items-center gap-4 sm:gap-8">
          <div className="text-center">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-['Lora']">Last 5 Avg</p>
            <p className="text-lg font-black font-['Lora'] text-[#d4aa37]">{userStats?.last5Avg ?? '--'}%</p>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-['Lora']">Exams Taken</p>
            <p className="text-lg font-black font-['Lora'] text-white">{userStats?.examsTaken ?? '--'}</p>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-['Lora']">Level</p>
            <p className="text-lg font-black font-['Lora'] text-white">{profile?.level || '1'} Level</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center">
           <button className="bg-[#b32839] hover:bg-[#a02230] text-white text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all shadow-lg active:scale-95">
             Share Rank
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardUserRank;

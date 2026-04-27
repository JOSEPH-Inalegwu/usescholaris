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

  const name = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar';
  const level = (profile?.level || '1').replace(' Level', '');
  const shareText = [
    `I just ranked #${rank} on the Scholaris leaderboard!`,
    `${name} | ${level} Level | ${userStats?.last5Avg ?? '--'}% Avg (Last 5 Exams)`,
    'Study smarter at scholaris.app — join me and top the board!',
  ].join('\n\n');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Scholaris Rank',
          text: shareText,
          url: 'https://scholaris.app/leaderboard',
        });
      } catch {
        // User cancelled or not supported
      }
    }
  };

  const openWhatsApp = () => {
    const groupLink = import.meta.env.VITE_WHATSAPP_GROUP;
    const url = groupLink
      ? `https://chat.whatsapp.com/${groupLink}?text=${encodeURIComponent(shareText)}`
      : `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 pointer-events-none flex justify-center z-50 px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 1 }}
        className="pointer-events-auto bg-white text-[#2d3435] px-6 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/10 flex items-center gap-8 max-w-2xl w-full"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              photoURL={user?.photoURL}
              displayName={profile?.name || user?.displayName}
              size="lg"
              className="ring-2 ring-[#d4aa37] shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#d4aa37] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
              #{rank}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] font-['Lora']">Your Standing</p>
            <h4 className="font-black text-sm font-['Lora'] tracking-tight whitespace-nowrap">{name}</h4>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-black/10 hidden sm:block" />

        <div className="flex-1 flex justify-around items-center gap-4 sm:gap-8">
          <div className="text-center">
            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] font-['Lora']">Last 5 Avg</p>
            <p className="text-lg font-black font-['Lora'] text-[#b32839]">{userStats?.last5Avg ?? '--'}%</p>
          </div>

          <div className="text-center">
            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] font-['Lora']">Exams Taken</p>
            <p className="text-lg font-black font-['Lora'] text-[#2d3435]">{userStats?.examsTaken ?? '--'}</p>
          </div>

          <div className="text-center">
            <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] font-['Lora']">Level</p>
            <p className="text-lg font-black font-['Lora'] text-[#2d3435]">{level}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleNativeShare}
            className="bg-[#2d3435] hover:bg-[#1a1f20] text-white text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100-2.186m0-2.186c.18 1.053.482 2.041.903 2.941A2.25 2.25 0 019.75 14.062m6 1.5V14.062m0-8.187a2.25 2.25 0 01.903-2.941 2.25 2.25 0 00.903 2.941m-6 0a2.25 2.25 0 100 2.186m0-2.186c.18-1.053.482-2.041.903-2.941A2.25 2.25 0 019.75 9.062m6 1.5V9.062m0 8.187a2.25 2.25 0 01-.903 2.941M9.75 14.062a2.25 2.25 0 00.903 2.941m6 0a2.25 2.25 0 00-.903-2.941M14.063 9.75a2.25 2.25 0 010 2.186m-6 0a2.25 2.25 0 000 2.186m6-1.5V9.062m0 8.187a2.25 2.25 0 01-.903 2.941" /&gt;
            </svg>
            Share
          </button>
          <button
            onClick={openWhatsApp}
            className="bg-[#25D366] hover:bg-[#1fb855] text-white text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.64.075-.297-.15-1.255-.463-2.39-1.475-.871-.68-1.365-1.517-1.525-1.775-.159-.259-.022-.403.151-.535.059-.045.188-.123.289-.185.099-.061.198-.048.29-.024.296.07.613.298.82.575.199.277.334.617.373.833.037.217.016.365-.078.515-.095.148-.452.605-.076.913.371.301.83.302 1.114.304.096.003.186-.002.269-.003.097-.002.268-.113.402-.285.131-.17.21-.382.236-.599.025-.217.002-.395-.109-.542-.112-.148-.441-.038-.54-.013.013.355.217.697.47.976.252.278.598.63.994.83.385.195.833.196 1.177.033.351-.166.699-.411.994-.756.299-.349.536-.78.597-1.125.062-.346.028-.594-.173-.893z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardUserRank;
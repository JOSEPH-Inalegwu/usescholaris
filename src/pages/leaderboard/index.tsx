import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { getFirstName } from '../../lib/utils';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  LeaderboardPodium, 
  LeaderboardList, 
  LeaderboardUserRank 
} from '../../components/leaderboard';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const { entries, loading, error, userRank, userStats } = useLeaderboard(
    user?.uid,
    { faculty: profile?.faculty, department: profile?.department, level: profile?.level }
  );

  const firstName = useMemo(() => getFirstName(profile?.name || user?.displayName), [profile?.name, user?.displayName]);

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);
  const restOfEntries = useMemo(() => entries.slice(3), [entries]);
  
  const userEntry = useMemo(() => entries.find(e => e.userId === user?.uid), [entries, user?.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded-lg w-48 mx-auto" />
            <div className="h-64 bg-gray-100 rounded-[2rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full p-4 md:p-8 relative">
        
        {/* Simplified Elegant Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b32839] bg-[#b32839]/5 px-3 py-1.5 rounded-full border border-[#b32839]/10">
              Based on Last 5 Exams
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-[#2d3435] font-['Lora'] tracking-tighter">
              {profile?.department || 'Department'} Leaders
            </h1>
            <p className="max-w-md mx-auto text-[#5a6061] text-xs md:text-sm font-medium font-['Lora'] opacity-70">
              Recognizing the top academic performers within your department.
            </p>
          </motion.div>
        </div>

        {error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-sm">
             <span className="material-symbols-outlined text-4xl text-[#b32839]/20 mb-3">error</span>
             <p className="text-[#5a6061] font-black font-['Lora'] uppercase tracking-widest text-[10px]">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-black/10">
             <span className="material-symbols-outlined text-4xl text-black/5 mb-3">history_edu</span>
             <p className="text-[#5a6061] font-black font-['Lora'] uppercase tracking-widest text-[10px]">No records found for your department</p>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {/* The Stage */}
            <LeaderboardPodium topThree={topThree} />

            {/* The Roll of Honor */}
            <div className="relative">
               <div className="flex items-center gap-4 mb-8 px-2">
                  <h3 className="text-[9px] font-black text-[#2d3435] uppercase tracking-[0.3em] font-['Lora'] whitespace-nowrap">
                    The Roll of Honor
                  </h3>
                  <div className="h-[1px] bg-black/5 w-full" />
               </div>
               <LeaderboardList entries={restOfEntries} currentUserId={user?.uid} />
            </div>
          </div>
        )}

        {/* The Prestige Badge */}
        <LeaderboardUserRank 
          rank={userRank} 
          userStats={userStats}
        />
      </div>
    </DashboardLayout>
  );
}

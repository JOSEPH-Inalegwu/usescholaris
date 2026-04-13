import React, { useMemo } from 'react';
import { useAuth } from '../../hooks';
import { getTimeBasedGreeting, getPersonalizedSubtext, getFirstName } from '../../lib/utils';

const GreetingHeader: React.FC = () => {
  const { profile, user, loading } = useAuth();

  const greeting = useMemo(() => getTimeBasedGreeting(), []);
  const subtext = useMemo(() => getPersonalizedSubtext(), []);

  const displayName = profile?.name || user?.displayName || undefined;
  const firstName = useMemo(() => getFirstName(displayName), [displayName]);

  const dailyReads = useMemo(() => {
    if (!user) return 0;
    const today = new Date().toLocaleDateString('en-CA');
    const dailyReadsKey = `exam_daily_reads_${user.uid}_${today}`;
    return parseInt(localStorage.getItem(dailyReadsKey) || '0');
  }, [user]);

  if (loading) {
    return (
      <header className="mb-10 animate-pulse">
        <div className="h-9 w-64 bg-[#f2f4f4] rounded-lg mb-3" />
        <div className="h-5 w-96 bg-[#f2f4f4] rounded-lg" />
      </header>
    );
  }

  return (
    <header className="mb-10 lg:mt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2d3435] font-['Lora']">
            {greeting}, <span className="text-[#d4aa37]">{firstName}.</span>
          </h2>
          <p className="text-[#5a6061] mt-2 font-medium tracking-wide">
            {subtext}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-sm border border-[#adb3b4]/20 shadow-sm self-start md:self-auto">
          <span className="material-symbols-outlined text-[#d4aa37] text-sm">database</span>
          <p className="text-[10px] font-bold text-[#5a6061] uppercase tracking-widest">
            {dailyReads} of 5 Daily Fetches Used
          </p>
        </div>
      </div>
    </header>
  );
};

export default GreetingHeader;

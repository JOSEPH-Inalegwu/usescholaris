import React, { useMemo } from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const ScholarisColors = {
  grey: '#ebeeef',
  light: '#ffcdd2',
  medium: '#ef5350',
  deep: '#b32839'
};

const StreakCalendar: React.FC = () => {
  const { streakCount, activityLog, loading } = useDashboardStats();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-CA'));
    }
    return days;
  }, []);

  const getIntensityColor = (count: number) => {
    if (count === 0) return ScholarisColors.grey;
    if (count <= 20) return ScholarisColors.light;
    if (count <= 39) return ScholarisColors.medium;
    return ScholarisColors.deep;
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#ebeeef] font-['Lora']">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a6061]">Activity Health</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ScholarisColors.deep}10` }}>
          <span className="material-symbols-outlined text-xs animate-pulse" style={{ color: ScholarisColors.deep, fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-[10px] font-bold" style={{ color: ScholarisColors.deep }}>
            {loading ? '--' : streakCount} Day Streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dateStr) => {
          const count = activityLog[dateStr] || 0;
          return (
            <div
              key={dateStr}
              className="aspect-square rounded-sm transition-all duration-300"
              style={{ backgroundColor: getIntensityColor(count) }}
              title={`${dateStr}: ${count} questions`}
            />
          );
        })}
      </div>

      {!loading && streakCount === 0 && (
        <p className="mt-4 text-[10px] text-[#b32839] text-center font-bold">Streak broken! Complete a full exam today.</p>
      )}
      
      {!loading && streakCount > 0 && (
        <div className="mt-4 flex justify-between items-center text-[9px] text-[#adb3b4] font-bold uppercase tracking-wider">
          <span>{calendarDays[0]}</span>
          <span className="text-[#b32839]">Active Health</span>
          <span>Today</span>
        </div>
      )}
    </div>
  );
};

export default StreakCalendar;

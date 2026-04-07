import React from 'react';

const StreakCalendar: React.FC = () => {
  const streakDays = [
    0, 0.2, 0.4, 0.6, 0.2, 0, 0,
    0.8, 1, 1, 0.6, 0.4, 0.8, 1,
    1, 0.2, 0.4, 0.6, 0.2, 0, 0,
  ];

  return (
    <div className="bg-white p-8 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a6061] font-['Lora']">Focus Streaks</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#b32839]/10 rounded-full">
          <span className="material-symbols-outlined text-[#b32839] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-[10px] font-bold text-[#b32839] font-['Lora']">12 Days</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {streakDays.map((opacity, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ background: opacity === 0 ? '#ebeeef' : `rgba(179, 40, 57, ${opacity})` }}
          />
        ))}
      </div>
      <p className="mt-6 text-[10px] text-[#5a6061] text-center leading-relaxed font-['Lora']">
        Complete 3 more days to unlock the{' '}
        <span className="text-[#5f5e5e] font-bold">"Diligent Curator"</span> achievement.
      </p>
    </div>
  );
};

export default StreakCalendar;

import React from 'react';

export const HeroSkeleton: React.FC = () => (
  <div className="relative overflow-hidden rounded-xl bg-white p-10 min-h-[320px] flex flex-col justify-between border border-[#ebeeef] animate-pulse">
    <div className="space-y-4">
      <div className="w-32 h-6 bg-[#f2f4f4] rounded-full" />
      <div className="w-3/4 h-10 bg-[#f2f4f4] rounded-lg" />
      <div className="w-full h-20 bg-[#f2f4f4] rounded-lg" />
    </div>
    <div className="flex gap-4">
      <div className="w-24 h-12 bg-[#f2f4f4] rounded-lg" />
    </div>
  </div>
);

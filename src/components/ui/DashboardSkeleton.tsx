import React from 'react';
import { HeroSkeleton } from './HeroSkeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-8 w-full">
      {/* Left Column Skeleton */}
      <div className="col-span-8 space-y-8">
        {/* Greeting Skeleton */}
        <div className="space-y-2 mb-10">
          <div className="h-8 w-64 bg-[#f2f4f4] rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-[#f2f4f4] rounded-lg animate-pulse" />
        </div>
        
        {/* Hero Card Skeleton */}
        <HeroSkeleton />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-[#ebeeef] p-5 space-y-4 animate-pulse">
              <div className="w-20 h-4 bg-[#f2f4f4] rounded-full" />
              <div className="w-16 h-8 bg-[#f2f4f4] rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="col-span-4 space-y-8">
        <div className="bg-white p-8 rounded-xl border border-[#ebeeef] h-[300px] animate-pulse space-y-6">
          <div className="w-full h-6 bg-[#f2f4f4] rounded-full" />
          <div className="w-32 h-32 rounded-full bg-[#f2f4f4] mx-auto" />
        </div>
        <div className="bg-white p-8 rounded-xl border border-[#ebeeef] h-[200px] animate-pulse space-y-4">
          <div className="w-full h-4 bg-[#f2f4f4] rounded-full" />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="aspect-square bg-[#f2f4f4] rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

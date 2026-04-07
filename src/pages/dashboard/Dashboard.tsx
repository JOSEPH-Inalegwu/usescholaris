import { useState, useEffect } from 'react'
import { Sidebar } from '../../components/layout'
import {
  TopAppBar,
  GreetingHeader,
  ActiveSessionHero,
  StatsGrid,
  ActivityFeed,
  GlobalPerformance,
  StreakCalendar,
  UpcomingEvents
} from '../../components/dashboard'
import { DashboardSkeleton } from '../../components/ui'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetching
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#f9f9f9] min-h-screen">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8 mt-16">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#2d3435] min-h-screen font-['Merriweather']">
      <Sidebar />

      {/* Main */}
      <main className="ml-64 min-h-screen relative flex flex-col">
        <TopAppBar />

        {/* Content */}
        <div className="mt-16 p-8 grid grid-cols-12 gap-8 flex-1">
          {/* Left Column */}
          <div className="col-span-8 space-y-8">
            <GreetingHeader />
            <ActiveSessionHero />
            <StatsGrid />
            <ActivityFeed />
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <GlobalPerformance />
              <StreakCalendar />
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

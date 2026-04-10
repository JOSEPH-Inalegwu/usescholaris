import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  GreetingHeader,
  ActiveSessionHero,
  StatsGrid,
  GlobalPerformance,
  StreakCalendar
} from '../../components/dashboard'
import { DashboardSkeleton } from '../../components/ui'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          <GreetingHeader />
          <ActiveSessionHero />
          <StatsGrid />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="lg:sticky lg:top-8 space-y-8">
            <GlobalPerformance />
            <StreakCalendar />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

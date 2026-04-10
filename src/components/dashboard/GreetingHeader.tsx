import React, { useMemo } from 'react';
import { useAuth } from '../../hooks';
import { getTimeBasedGreeting, getPersonalizedSubtext, getFirstName } from '../../lib/utils';

const GreetingHeader: React.FC = () => {
  const { profile, user, loading } = useAuth();

  const greeting = useMemo(() => getTimeBasedGreeting(), []);
  const subtext = useMemo(() => getPersonalizedSubtext(), []);

  const displayName = profile?.name || user?.displayName || undefined;
  const firstName = useMemo(() => getFirstName(displayName), [displayName]);

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
      <h2 className="text-3xl font-extrabold tracking-tight text-[#2d3435] font-['Lora']">
        {greeting}, <span className="text-[#535252]">{firstName}.</span>
      </h2>
      <p className="text-[#5a6061] mt-2 font-medium tracking-wide">
        {subtext}
      </p>
    </header>
  );
};

export default GreetingHeader;

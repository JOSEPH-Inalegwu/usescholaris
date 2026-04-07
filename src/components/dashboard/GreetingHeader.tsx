import React, { useMemo } from 'react';
import { useAuth } from '../../hooks';
import { getTimeBasedGreeting, getPersonalizedSubtext, getFirstName } from '../../lib/utils';

const GreetingHeader: React.FC = () => {
  const { profile } = useAuth();

  const greeting = useMemo(() => getTimeBasedGreeting(), []);
  const subtext = useMemo(() => getPersonalizedSubtext(), []);
  const firstName = useMemo(() => getFirstName(profile?.name), [profile?.name]);

  return (
    <header className="mb-10">
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

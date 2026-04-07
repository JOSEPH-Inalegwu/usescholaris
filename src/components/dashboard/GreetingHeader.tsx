import React from 'react';

interface GreetingHeaderProps {
  userName: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
  return (
    <header className="mb-10">
      <h2 className="text-3xl font-extrabold tracking-tight text-[#2d3435] font-['Lora']">
        Good morning, <span className="text-[#535252]">{userName}.</span>
      </h2>
      <p className="text-[#5a6061] mt-2 font-medium tracking-wide">Today is a great day to advance your research.</p>
    </header>
  );
};

export default GreetingHeader;

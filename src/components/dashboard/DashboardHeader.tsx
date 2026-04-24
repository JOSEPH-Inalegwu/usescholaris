import React from 'react';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="lg:hidden flex items-center justify-between w-full h-12 px-4 bg-white border-b border-[#e5e7eb]">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 transition-colors bg-red-100"
      >
        <span className="material-symbols-outlined text-xl" style={{ color: '#b32839' }}>menu</span>
      </button>
    </header>
  );
};

export default DashboardHeader;
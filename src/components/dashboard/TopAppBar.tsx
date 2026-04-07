import React from 'react';

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff', accent: '#b32839' };

interface TopAppBarProps {
  onMenuOpen?: () => void;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ onMenuOpen }) => {
  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 bg-[#f9f9f9]/90 backdrop-blur-md z-[50] flex justify-between items-center px-4 md:px-8 border-b border-[#adb3b4]/10">
      <div className="flex items-center gap-4">
        {/* Floating Hamburger for Mobile */}
        <button 
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-[#ebeeef] transition-colors"
          style={{ color: goldPalette.primary }}
        >
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-4">
          <span className="text-[10px] font-bold text-[#5a6061] font-['Lora']">Curriculum Progress</span>
          <div className="w-24 md:w-48 h-1 bg-[#ebeeef] rounded-full overflow-hidden">
            <div className="h-full bg-[#b32839] w-3/4 rounded-full" />
          </div>
          <span className="text-[10px] font-bold text-[#b32839] font-['Lora']">75%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative hidden md:block">
          <input
            className="bg-[#f2f4f4] border-none rounded-full px-4 py-1.5 text-[10px] w-32 lg:w-48 focus:ring-1 focus:ring-[#5f5e5e] outline-none transition-all font-['Lora']"
            placeholder="SEARCH ARCHIVE..."
            type="text"
          />
          <span className="material-symbols-outlined absolute right-3 top-1.5 text-lg text-[#757c7d]">search</span>
        </div>
        
        {/* Mobile Search Icon Only */}
        <button className="md:hidden material-symbols-outlined text-[#5a6061] p-2 hover:bg-[#ebeeef] rounded-lg">search</button>
        
        <div className="flex items-center gap-1 md:gap-4">
          <button className="material-symbols-outlined text-[#5a6061] p-2 hover:bg-[#ebeeef] rounded-lg transition-colors">notifications</button>
          <button className="hidden sm:block material-symbols-outlined text-[#5a6061] p-2 hover:bg-[#ebeeef] rounded-lg transition-colors">help_outline</button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;

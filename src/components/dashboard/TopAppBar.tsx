import React from 'react';

const TopAppBar: React.FC = () => {
  return (
    <header className="h-16 fixed top-0 right-0 left-64 bg-[#f9f9f9]/80 backdrop-blur-md z-40 flex justify-between items-center px-8 border-b border-[#adb3b4]/10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-[#5a6061] font-['Lora']">Curriculum Progress</span>
          <div className="w-48 h-1 bg-[#ebeeef] rounded-full overflow-hidden">
            <div className="h-full bg-[#b32839] w-3/4 rounded-full" />
          </div>
          <span className="text-[10px] font-bold text-[#b32839] font-['Lora']">75%</span>
        </div>
        <nav className="hidden md:flex gap-6 text-[10px] uppercase tracking-widest font-['Lora']">
          <a className="text-[#5a6061] hover:text-[#1A1A1A] transition-colors" href="#">Research</a>
          <a className="text-[#5a6061] hover:text-[#1A1A1A] transition-colors" href="#">Archive</a>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <input
            className="bg-[#f2f4f4] border-none rounded-full px-4 py-1.5 text-[10px] w-48 focus:ring-1 focus:ring-[#5f5e5e] outline-none transition-all font-['Lora']"
            placeholder="SEARCH ARCHIVE..."
            type="text"
          />
          <span className="material-symbols-outlined absolute right-3 top-1.5 text-lg text-[#757c7d]">search</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#5a6061] hover:text-[#5f5e5e] transition-colors">notifications</button>
          <button className="material-symbols-outlined text-[#5a6061] hover:text-[#5f5e5e] transition-colors">help_outline</button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;

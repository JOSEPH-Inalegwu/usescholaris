import React from 'react';

const UpcomingEvents: React.FC = () => {
  return (
    <div className="p-6 bg-[#5f5e5e] text-white rounded-xl relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 font-['Lora']">Upcoming Seminar</h4>
        <p className="font-bold text-sm mb-4 font-['Lora']">Neural Architecture: The 2024 Symposium</p>
        <button className="w-full py-2 bg-white text-[#5f5e5e] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#b32839] hover:text-white transition-colors font-['Lora']">
          Join Waiting List
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <span className="material-symbols-outlined" style={{ fontSize: '8rem' }}>school</span>
      </div>
    </div>
  );
};

export default UpcomingEvents;

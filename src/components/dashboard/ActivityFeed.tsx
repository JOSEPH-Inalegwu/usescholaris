import React, { useState } from 'react';

const ActivityFeed: React.FC = () => {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

  const activities = [
    { icon: 'article', color: '#b32839', title: 'Recursive Optimization in High-Order Logic', desc: 'Exploring the intersections of computational theory and classical mathematical proofs...', time: '2h ago' },
    { icon: 'history_edu', color: '#5f5e5e', title: 'The Ethics of Algorithmic Governance', desc: 'A critical analysis of decision-making frameworks in autonomous system architectures...', time: 'Yesterday' },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg tracking-tight font-['Lora']">Recent Activity</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('grid')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'grid' ? 'bg-[#ebeeef] text-[#2d3435]' : 'bg-white text-[#adb3b4] hover:text-[#5f5e5e]'}`}
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'list' ? 'bg-[#ebeeef] text-[#2d3435]' : 'bg-white text-[#adb3b4] hover:text-[#5f5e5e]'}`}
          >
            <span className="material-symbols-outlined text-lg">list</span>
          </button>
        </div>
      </div>
      <div className={activeView === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
        {activities.map((item) => (
          <div key={item.title} className="p-6 bg-white rounded-xl group cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: item.color, background: `${item.color}15` }}>{item.icon}</span>
              <span className="text-[10px] font-medium text-[#5a6061] font-['Lora']">{item.time}</span>
            </div>
            <h4 className="font-bold text-[#2d3435] group-hover:text-[#b32839] transition-colors mb-2 text-sm font-['Lora']">{item.title}</h4>
            <p className="text-xs text-[#5a6061] leading-relaxed line-clamp-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActivityFeed;

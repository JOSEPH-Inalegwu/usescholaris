import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { getFirstName } from '../../lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile, user, loading } = useAuth();

  const displayName = profile?.name || user?.displayName || undefined;
  const firstName = useMemo(() => getFirstName(displayName), [displayName]);
  const initials = useMemo(() => {
    if (!displayName) return 'S';
    return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [displayName]);

  const menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/questions', icon: 'quiz', label: 'Questions' },
    { path: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="flex flex-col h-screen py-8 bg-[#f2f4f4] w-64 fixed left-0 top-0 overflow-y-auto z-50 border-r border-transparent font-['Merriweather']">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold tracking-tighter text-[#1A1A1A] uppercase font-['Lora']">Scholaris</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a6061] font-medium mt-1 font-['Lora']">Elite Scholar Portal</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-3 mx-4 rounded-lg flex items-center gap-3 transition-all active:scale-[0.98] ${isActive(item.path)
                ? 'bg-[#ebeeef] text-[#5f5e5e] font-semibold'
                : 'text-[#5a6061] hover:bg-[#ebeeef]/50'
              }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-4 space-y-1 pt-4 border-t border-[#adb3b4]/10">
        <button className="w-full text-[#5a6061] hover:bg-[#ebeeef]/50 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[22px]">dark_mode</span>
          <span className="text-sm">Dark Mode</span>
        </button>
        <button className="w-full text-[#5a6061] hover:bg-[#ebeeef]/50 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span className="text-sm">Settings</span>
        </button>

        <div className="mt-6 px-2 py-4 flex items-center gap-3 bg-[#f2f4f4]/50 rounded-xl">
          {loading ? (
            <div className="flex items-center gap-3 w-full animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#ebeeef]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#ebeeef] rounded w-20" />
                <div className="h-2 bg-[#ebeeef] rounded w-16" />
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#2d3435] flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                {user && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f2f4f4] rounded-full" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-[#2d3435] font-['Lora']">{firstName}</p>
                <p className="text-[10px] text-[#5a6061] uppercase tracking-wider font-['Lora']">
                  {profile?.level || 'Scholar'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

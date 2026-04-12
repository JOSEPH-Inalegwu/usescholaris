import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { getFirstName } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  isDrawer?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: _isOpen, isDrawer, onClose }) => {
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
  ];

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className={`flex flex-col h-full py-8 bg-[#f2f4f4] w-64 border-r border-transparent font-['Merriweather'] overflow-y-auto`}>
      <div className="px-6 mb-10 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-[#1A1A1A] uppercase font-['Lora']">Scholaris</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a6061] font-medium mt-1 font-['Lora']">Elite Scholar Portal</p>
        </div>
        {isDrawer && (
          <button onClick={onClose} className="lg:hidden text-[#5a6061]">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => isDrawer && onClose?.()}
            className={`px-4 py-3 mx-4 rounded-lg flex items-center gap-3 transition-all active:scale-[0.98] ${isActive(item.path)
              ? 'bg-[#ebeeef] text-[#5f5e5e] font-semibold'
              : 'text-[#5a6061] hover:bg-[#ebeeef]/50'
              }`}
          >
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ color: isActive(item.path) ? '#d4aa37' : 'inherit' }}
            >
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-4 space-y-1 pt-4 border-t border-[#adb3b4]/10">
        <button className="w-full text-[#5a6061] hover:bg-[#ebeeef]/50 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[22px]">dark_mode</span>
          <span className="text-sm">Dark Mode</span>
        </button>
        <Link 
          to="/settings"
          onClick={() => isDrawer && onClose?.()}
          className={`w-full text-[#5a6061] hover:bg-[#ebeeef]/50 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors active:scale-[0.98] ${isActive('/settings')
            ? 'bg-[#ebeeef] text-[#5f5e5e] font-semibold'
            : ''
            }`}
        >
          <span 
            className="material-symbols-outlined text-[22px]"
            style={{ color: isActive('/settings') ? '#d4aa37' : 'inherit' }}
          >
            settings
          </span>
          <span className="text-sm">Settings</span>
        </Link>

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
    </div>
  );

  if (isDrawer) {
    return (
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen z-[70] lg:hidden"
      >
        {sidebarContent}
      </motion.aside>
    );
  }

  return (
    <aside className="h-screen sticky top-0">
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;

import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout';
import { ChatWidget } from '../components/chat/ChatWidget';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { AnimatePresence, motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const isExamActive = location.pathname.startsWith('/exam/');

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  return (
    <div className="bg-[#f9f9f9] text-[#2d3435] min-h-screen font-['Merriweather'] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar isOpen={true} isDrawer={false} onChatOpen={() => setIsChatOpen(true)} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <Sidebar 
              isOpen={isSidebarOpen} 
              isDrawer={true} 
              onClose={() => setIsSidebarOpen(false)}
              onChatOpen={() => setIsChatOpen(true)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      {!isExamActive && <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}

      <main className="flex-1 min-h-screen relative flex flex-col min-w-0">
        <DashboardHeader onMenuClick={handleMenuClick} />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

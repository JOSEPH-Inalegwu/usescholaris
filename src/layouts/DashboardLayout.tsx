import React, { useState } from 'react';
import { Sidebar } from '../components/layout';
import { TopAppBar } from '../components/dashboard';
import { AnimatePresence, motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f9f9f9] text-[#2d3435] min-h-screen font-['Merriweather'] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar isOpen={true} isDrawer={false} />
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
            />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-h-screen relative flex flex-col min-w-0">
        {/* Pass the toggle function directly to TopAppBar */}
        <TopAppBar onMenuOpen={() => setIsSidebarOpen(true)} />
        
        <div className="mt-16 p-4 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

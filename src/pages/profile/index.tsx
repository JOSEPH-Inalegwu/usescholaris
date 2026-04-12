import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../hooks';
import { auth } from '../../lib/firebase/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_UID = 'vnn5Rf2FjGfngTqTZTsDCT90gDT2';

const SettingsPage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    reminders: true,
    digests: false
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateNotifications = (type: 'reminders' | 'digests') => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    setToast(`Notification preference updated. We'll reach you at ${user?.email}`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleWhatsAppReport = () => {
    const adminPhone = import.meta.env.VITE_ADMIN_WHATSAPP;
    if (!adminPhone) {
      alert("Support contact not configured. Please contact the administrator.");
      return;
    }
    const message = encodeURIComponent("Hi Joseph, I found an issue in Scholaris...");
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#b32839]/20 border-t-[#b32839] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto font-['Lora'] pb-20 p-4 space-y-12">
        <header>
            <h1 className="text-3xl font-black text-[#2a2d2e]">Account Settings</h1>
            <p className="text-sm text-[#757c7d] mt-1 font-medium">Manage your scholar profile and portal access.</p>
        </header>

        {/* Section 1: Profile Overview */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-[#adb3b4] uppercase tracking-[0.2em]">Scholar Profile</h3>
          <div className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-24 h-24 bg-[#2a2d2e] rounded-full flex items-center justify-center text-white text-4xl font-black shrink-0 border-4 border-[#f2f4f4]">
                {profile?.name?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-[#2a2d2e]">{profile?.name || 'Scholaris Student'}</h2>
                  <p className="text-[#757c7d] text-sm font-medium">{user?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-[#fdfaf2] border border-[#d4aa37]/30 text-[#d4aa37] text-[10px] font-black uppercase tracking-widest rounded-sm">
                    {profile?.level || 'Level Not Set'}
                  </div>
                  <div className="px-3 py-1 bg-[#fdfaf2] border border-[#d4aa37]/30 text-[#d4aa37] text-[10px] font-black uppercase tracking-widest rounded-sm">
                    {profile?.department || 'Department Not Set'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Notification Settings */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-[#adb3b4] uppercase tracking-[0.2em]">Notification Settings</h3>
          <div className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2a2d2e]">Study Reminders</p>
                <p className="text-[10px] text-[#757c7d]">Receive alerts to maintain your study streak.</p>
              </div>
              <button 
                onClick={() => updateNotifications('reminders')}
                className={`w-10 h-6 rounded-full transition-colors relative ${notifications.reminders ? 'bg-[#d4aa37]' : 'bg-[#adb3b4]/30'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.reminders ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-[#f2f4f4]">
              <div>
                <p className="text-sm font-bold text-[#2a2d2e]">Performance Digests</p>
                <p className="text-[10px] text-[#757c7d]">Weekly summary of your academic progress.</p>
              </div>
              <button 
                onClick={() => updateNotifications('digests')}
                className={`w-10 h-6 rounded-full transition-colors relative ${notifications.digests ? 'bg-[#d4aa37]' : 'bg-[#adb3b4]/30'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.digests ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Direct Support */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-[#adb3b4] uppercase tracking-[0.2em]">Direct Support</h3>
          <div className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
            <p className="text-sm text-[#5a6061] mb-6 font-medium leading-relaxed">Encountered an error or a typo in a question? Report it directly to our engineering lead via WhatsApp.</p>
            <button 
              onClick={handleWhatsAppReport}
              className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white text-[10px] font-black rounded-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">bug_report</span>
              Report a Bug / Typo
            </button>
          </div>
        </section>

        {/* Section 4: Security */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-[#adb3b4] uppercase tracking-[0.2em]">Security</h3>
          <div className="bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-[#2a2d2e]">Portal Session</p>
              <p className="text-[10px] text-[#757c7d]">Securely sign out of your account on all devices.</p>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-3 border border-[#adb3b4]/30 text-[#2a2d2e] text-[10px] font-black rounded-sm uppercase tracking-widest hover:bg-[#f2f4f4] transition-all"
            >
              Logout from All Devices
            </button>
          </div>
        </section>

        {/* Section 5: Admin Control Center (Conditional) */}
        {user?.uid === ADMIN_UID && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-[#d4aa37] uppercase tracking-[0.2em]">Administrative Engine</h3>
            <div className="bg-white p-8 rounded-sm border border-[#d4aa37]/30 shadow-sm relative overflow-hidden group">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4aa37]/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#d4aa37] text-xl">shield_person</span>
                  <p className="text-[#2a2d2e] font-bold tracking-tight">Master Administrative Access</p>
                </div>
                <p className="text-[#5a6061] text-sm mb-10 max-w-xl leading-relaxed font-medium">
                  Direct gateway to the core Scholaris knowledge engine. Synchronize question banks, 
                  validate material integrity, and manage global study assets.
                </p>
                <button 
                  onClick={() => navigate('/admin/upload')}
                  className="flex items-center gap-4 bg-[#d4aa37] text-black px-10 py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#2a2d2e] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-bold">lock</span>
                  Launch Question Uploader
                  <span className="material-symbols-outlined text-sm font-bold ml-2">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Section 6: Danger Zone */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-[#b32839] uppercase tracking-[0.2em]">Danger Zone</h3>
          <div className="bg-red-50/20 p-8 rounded-sm border border-[#b32839]/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
            <div className="space-y-2">
              <p className="text-sm font-black text-[#2a2d2e] uppercase tracking-wider">Permanent Deletion</p>
              <p className="text-[10px] text-[#757c7d] leading-relaxed font-medium max-w-md">
                This will permanently remove your entire academic footprint from the Scholaris network, including all streaks, points, and badges.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-10 py-4 bg-[#b32839] text-white text-[10px] font-black rounded-sm uppercase tracking-widest hover:bg-[#8b1a2a] transition-all active:scale-95 shadow-md shrink-0"
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-md p-10 rounded-sm shadow-2xl border border-[#adb3b4]/20 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#f2f4f4] rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[#2a2d2e] text-3xl">logout</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2a2d2e]">Confirm Logout</h2>
                  <p className="text-sm text-[#5a6061] leading-relaxed">
                    Are you sure you want to end your session? You will need to re-authenticate to access your scholar profile.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    className="w-full py-4 bg-[#2a2d2e] text-white text-[11px] font-black rounded-sm uppercase tracking-[0.2em] hover:bg-[#b32839] transition-all"
                    onClick={handleLogout}
                  >
                    Confirm and Sign Out
                  </button>
                  <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full py-4 bg-transparent text-[#757c7d] text-[11px] font-black rounded-sm uppercase tracking-[0.2em] hover:bg-[#f2f4f4] transition-all"
                  >
                    Cancel and Return
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-md p-10 rounded-sm shadow-2xl border border-[#adb3b4]/20 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[#b32839] text-3xl">warning</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2a2d2e]">Irreversible Action</h2>
                  <p className="text-sm text-[#5a6061] leading-relaxed">
                    You are about to permanently delete your Scholaris account. This will erase all your streaks, points, and earned elite badges. This cannot be undone.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    className="w-full py-4 bg-[#b32839] text-white text-[11px] font-black rounded-sm uppercase tracking-[0.2em] hover:bg-[#8b1a2a] transition-all"
                    onClick={() => {/* Final deletion logic */}}
                  >
                    Confirm Permanent Deletion
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-4 bg-transparent text-[#757c7d] text-[11px] font-black rounded-sm uppercase tracking-[0.2em] hover:bg-[#f2f4f4] transition-all"
                  >
                    Cancel and Return
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4"
            >
              <div className="bg-[#d4aa37] text-white p-4 rounded-sm shadow-2xl border border-white/10 flex items-center gap-4">
                <span className="material-symbols-outlined text-white text-sm">notifications_active</span>
                <p className="text-[11px] font-medium tracking-wide flex-1">{toast}</p>
                <button onClick={() => setToast(null)} className="text-white/60 hover:text-white">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

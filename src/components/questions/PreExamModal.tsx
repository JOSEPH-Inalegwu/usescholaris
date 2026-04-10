import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Course } from '../../types/question';

interface PreExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  course: Course | null;
  isResuming?: boolean;
}

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff', accent: '#b32839' };

const PreExamModal: React.FC<PreExamModalProps> = ({ isOpen, onClose, onConfirm, course, isResuming }) => {
  if (!course) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Lora']">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-sm overflow-hidden shadow-2xl border border-[#adb3b4]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top banner */}
            <div className="bg-[#b32839] py-2 px-6 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-white text-sm animate-pulse">priority_high</span>
              <span className="text-white font-bold text-[9px] uppercase tracking-[0.2em]">Exam in Progress</span>
            </div>

            {/* Header */}
            <div className="p-6 border-b border-[#adb3b4]/10">
              <div className="flex justify-between items-start mb-2">
                <div
                  className="px-2 py-0.5 rounded-sm text-[9px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: goldPalette.primary }}
                >
                  {course.code}
                </div>
                <button
                  onClick={onClose}
                  className="material-symbols-outlined text-[#757c7d] hover:text-[#2a2d2e] transition-colors text-lg"
                >
                  close
                </button>
              </div>
              <h2 className="text-xl font-bold text-[#2a2d2e]">{course.title}</h2>
              <p className="text-[#757c7d] text-xs mt-1">
                {isResuming ? 'You have an unfinished session — pick up where you left off.' : 'Read the instructions below before you begin.'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f2f4f4] px-4 py-3 rounded-sm border border-[#adb3b4]/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-[#b32839]">format_list_numbered</span>
                  <div>
                    <p className="text-[9px] text-[#757c7d] uppercase font-bold tracking-wider">Questions</p>
                    <p className="text-sm font-bold text-[#2a2d2e]">40</p>
                  </div>
                </div>
                <div className="bg-[#f2f4f4] px-4 py-3 rounded-sm border border-[#adb3b4]/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-[#d4aa37]">timer</span>
                  <div>
                    <p className="text-[9px] text-[#757c7d] uppercase font-bold tracking-wider">Time</p>
                    <p className="text-sm font-bold text-[#2a2d2e]">30 mins</p>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-[#b32839]/5 p-4 rounded-sm border border-[#b32839]/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#b32839]">info</span>
                  <h3 className="font-bold text-[#b32839] text-[9px] uppercase tracking-wider">Before You Start</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Your score will be recorded and reflected on your dashboard.
                  </li>
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Do not switch tabs or leave the page during the exam.
                  </li>
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Questions are drawn randomly from a pool of {course.questionCount}.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#f9f9f9] border-t border-[#adb3b4]/10 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-sm text-[10px] font-bold text-[#757c7d] hover:bg-[#ebeeef] transition-colors uppercase tracking-widest border border-[#adb3b4]/20"
              >
                Go Back
              </button>
              <button
                onClick={onConfirm}
                className="flex-[2] py-3 rounded-sm text-[10px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ backgroundColor: goldPalette.accent }}
              >
                <span>{isResuming ? 'Continue Exam' : 'Start Exam'}</span>
                <span className="material-symbols-outlined text-sm">{isResuming ? 'play_circle' : 'rocket_launch'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PreExamModal;

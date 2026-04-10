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
            {/* High Stakes Warning Banner */}
            <div className="bg-[#b32839] py-2 px-6 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-white text-sm animate-pulse">priority_high</span>
              <span className="text-white font-bold text-[9px] uppercase tracking-[0.2em]">Ranked Session Active</span>
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
              <p className="text-[#757c7d] text-xs italic mt-1">
                {isResuming ? 'Resuming Active Session' : 'Evaluation Environment'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Session Constraints */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f2f4f4] p-4 rounded-sm border border-[#adb3b4]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#b32839]">format_list_numbered</span>
                    <span className="text-[10px] text-[#757c7d] uppercase font-bold tracking-wider">Exam Limit</span>
                  </div>
                  <div className="text-lg font-bold text-[#2a2d2e]">40 Questions</div>
                  <div className="text-[9px] text-[#b32839] font-medium mt-1 uppercase">Strictly Enforced</div>
                </div>
                <div className="bg-[#f2f4f4] p-4 rounded-sm border border-[#adb3b4]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#d4aa37]">timer</span>
                    <span className="text-[10px] text-[#757c7d] uppercase font-bold tracking-wider">Time Cap</span>
                  </div>
                  <div className="text-lg font-bold text-[#2a2d2e]">30 Minutes</div>
                  <div className="text-[9px] text-[#757c7d] mt-1 uppercase">45s per question</div>
                </div>
              </div>

              {/* Ranked Rules */}
              <div className="bg-[#b32839]/5 p-4 rounded-sm border border-[#b32839]/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#b32839]">stars</span>
                  <h3 className="font-bold text-[#b32839] text-[9px] uppercase tracking-wider">Ranking Impact Warning</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Global Percentile updates immediately upon submission.
                  </li>
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Integrity Protocol:<span className="font-bold text-[#b32839]">Visibility tracking active</span>.
                  </li>
                  <li className="flex gap-3 text-[10px] text-[#5a6061] leading-relaxed">
                    <span className="text-[#b32839] font-bold">•</span>
                    Questions are randomized from a pool of {course.questionCount}.
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
                Retreat
              </button>
              <button
                onClick={onConfirm}
                className="flex-[2] py-3 rounded-sm text-[10px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ backgroundColor: goldPalette.accent }}
              >
                <span>{isResuming ? 'Resume Ranked Session' : 'Commence Ranked Session'}</span>
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

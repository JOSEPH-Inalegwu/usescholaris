import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SCHOLARIS_FACTS } from '../../constants/scholarisFacts';

const ActiveSessionHero: React.FC = () => {
  const navigate = useNavigate();
  const [insight, setInsight] = useState(SCHOLARIS_FACTS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsight(SCHOLARIS_FACTS[Math.floor(Math.random() * SCHOLARIS_FACTS.length)]);
    }, 90000); // 90 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <section className="rounded-xl bg-[#fdfaf2] p-8 lg:p-12 min-h-[300px] flex flex-col justify-between border border-[#d4aa37]/20 shadow-sm transition-all relative overflow-hidden">

          {/* Decorative Star/Sparkle Icons */}
          <div className="absolute top-10 left-10 z-[2] text-white/80 text-[10px]">✦</div>
          <div className="absolute top-20 right-20 z-[2] text-white/70 text-[8px]">✦</div>
          <div className="absolute bottom-10 right-10 z-[2] text-white/80 text-[12px]">✦</div>

          {/* 4x4 Grid Overlay */}
          <div className="absolute inset-0 z-[1] opacity-[0.1]"
            style={{
              backgroundImage: 'linear-gradient(#2a2d2e 1px, transparent 1px), linear-gradient(90deg, #2a2d2e 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Dancing Circles */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 20, -20, 0],
                y: [0, -20, 20, 0]
              }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute z-[1] rounded-full bg-[#d4aa37]/10 ${i === 1 ? 'top-[-20px] left-[-20px] w-32 h-32' : i === 2 ? 'bottom-[-40px] right-[-20px] w-48 h-48' : 'top-1/2 left-1/3 w-16 h-16'}`}
            />
          ))}

          {/* Stars */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360, opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute z-[2] text-white/70 text-[12px]"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`
              }}
            >✦</motion.div>
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-2xl">
            <h2 className="text-3xl font-black text-[#2a2d2e] mb-6 font-['Lora'] tracking-tighter">
              {insight.header}
            </h2>
            <p className="text-[#5a6061] text-lg italic leading-relaxed font-['Lora'] bg-white/40 p-4 rounded-md">
              "{insight.subtext}"
            </p>
          </div>

          <div className="relative z-10 mt-10 flex justify-start">
            <button
              onClick={() => navigate('/questions')}
              className="bg-white text-[#2a2d2e] px-10 py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#2a2d2e] hover:text-white transition-all shadow-md"
            >
              Launch Session
            </button>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveSessionHero;

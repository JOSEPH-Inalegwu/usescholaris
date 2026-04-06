import { motion } from 'framer-motion'

export const AuthLeftPanel = () => {
    return (
        <section className="w-full md:w-1/2 flex flex-col justify-between p-10 md:p-16 bg-[#f2f4f4] bg-[radial-gradient(circle,_#00000008_1px,_transparent_1px)] bg-[length:32px_32px] min-h-screen border-r border-[#adb3b4]/10">
            <div className="flex flex-col space-y-10">
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 bg-[#2d3435] flex items-center justify-center rounded-lg shadow-sm">
                        <img src="/favicon.png" alt="Scholaris" className="w-8 h-8" />
                    </div>
                    <span style={{ fontFamily: 'Merriweather, serif' }} className="font-extrabold text-2xl tracking-tighter text-[#2d3435]">Scholaris</span>
                </motion.div>

                {/* Headline */}
                <div className="space-y-4 pt-8">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b32839]"
                    >
                        Academic Excellence Platform
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{ fontFamily: 'Merriweather, serif' }} 
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d3435] leading-[1.15] max-w-lg tracking-tight"
                    >
                        Where scholars compete and rise.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{ fontFamily: 'Lora, serif' }}
                        className="text-[#5a6061] text-lg leading-relaxed max-w-lg font-medium"
                    >
                        Built for university students who take learning seriously. Compete, track streaks, and climb the leaderboard.
                    </motion.p>
                </div>

                {/* Feature Bullets */}
                <div className="space-y-6 pt-4">
                    {[
                        { icon: 'leaderboard', title: 'Global & department leaderboards', desc: 'Compete with peers across every faculty and course.' },
                        { icon: 'local_fire_department', title: 'Daily streaks & challenges', desc: 'Stay consistent with streaks that reward dedication.' },
                        { icon: 'quiz', title: 'Thousands of curated questions', desc: 'Course-aligned questions reviewed by educators.' },
                    ].map((item, i) => (
                        <motion.div 
                            key={item.icon} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                            className="flex items-start gap-4 group"
                        >
                            <div className="p-2 rounded-lg bg-white border border-[#dde4e5] text-[#2d3435] mt-0.5 flex-shrink-0 shadow-sm group-hover:bg-[#2d3435] group-hover:text-white transition-colors duration-300">
                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            </div>
                            <div>
                                <h3 style={{ fontFamily: 'Merriweather, serif' }} className="font-bold text-[#2d3435] text-sm">{item.title}</h3>
                                <p style={{ fontFamily: 'Lora, serif' }} className="text-[#5a6061] text-xs mt-0.5 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom avatars */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="pt-12"
            >
                <div className="flex -space-x-2">
                    {['AO', 'KM', 'TF'].map((initials, i) => (
                        <div key={i} className="w-9 h-9 rounded-full border-2 border-[#f2f4f4] bg-[#5f5e5e] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                            {initials}
                        </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-[#f2f4f4] bg-[#b32839] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        +5k
                    </div>
                </div>
                <p style={{ fontFamily: 'Lora, serif' }} className="text-xs text-[#5a6061] mt-2 font-medium">Students competing right now</p>
            </motion.div>
        </section>
    )
}

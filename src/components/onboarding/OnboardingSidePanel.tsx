import { motion } from 'framer-motion'
import { auth } from '../../lib/firebase/firebase'

interface OnboardingSidePanelProps {
    step: number;
    title: string;
    description: string;
}

export const OnboardingSidePanel = ({ step, title, description }: OnboardingSidePanelProps) => {
    const user = auth.currentUser;
    const firstName = user?.displayName?.split(' ')[0] || 'Scholar';

    return (
        <section className="hidden md:flex w-1/2 flex-col justify-between p-16 lg:p-24 bg-[#f2f4f4] bg-[radial-gradient(circle,_#00000008_1px,_transparent_1px)] bg-[length:32px_32px] min-h-screen border-r border-[#adb3b4]/10">
            <div className="flex flex-col space-y-12">
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 bg-[#2d3435] flex items-center justify-center rounded-lg">
                        <img src="/favicon.png" alt="Scholaris" className="w-8 h-8" />
                    </div>
                    <span style={{ fontFamily: 'Merriweather, serif' }} className="font-extrabold text-xl tracking-tight text-[#2d3435]">Scholaris</span>
                </motion.div>

                {/* Welcome Message */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 style={{ fontFamily: 'Merriweather, serif' }} className="text-4xl lg:text-5xl font-bold text-[#2d3435] leading-tight">
                            Welcome, <br />
                            <span className="text-[#b32839]">{firstName}.</span>
                        </h1>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontFamily: 'Lora, serif' }}
                        className="text-[#5a6061] text-lg leading-relaxed max-w-md font-medium"
                    >
                        We're tailoring the platform to your academic profile. This ensures you see the right challenges, curated questions, and your relevant department leaderboards.
                    </motion.p>
                </div>

                {/* Visual Step Indicator */}
                <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#adb3b4]">Current Progress</p>
                    <div className="flex gap-2 h-1.5 w-48">
                        {[1, 2, 3].map((s) => (
                            <div 
                                key={s} 
                                className={`flex-1 rounded-full transition-all duration-500 ${
                                    s <= step ? 'bg-[#2d3435]' : 'bg-[#dde4e5]'
                                }`} 
                            />
                        ))}
                    </div>
                    <p style={{ fontFamily: 'Lora, serif' }} className="text-xs font-bold text-[#2d3435]">
                        {title}
                    </p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white max-w-sm"
            >
                <div className="w-10 h-10 rounded-full bg-[#dde4e5] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#5f5e5e]">auto_awesome</span>
                </div>
                <p className="text-xs text-[#5a6061] leading-normal font-medium italic">
                    "The beautiful thing about learning is that no one can take it away from you."
                </p>
            </motion.div>
        </section>
    )
}

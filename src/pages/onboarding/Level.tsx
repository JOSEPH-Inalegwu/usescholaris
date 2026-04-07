import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingSidePanel } from '../../components/onboarding/OnboardingSidePanel'
import { motion } from 'framer-motion'
import { useOnboarding } from '../../context/OnboardingContext'

const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level']

export default function LevelPage() {
    const { data, updateData } = useOnboarding()
    const [selectedLevel, setSelectedLevel] = useState(data.level || '')
    const navigate = useNavigate()

    const handleContinue = () => {
        if (!selectedLevel) return
        updateData({ level: selectedLevel })
        navigate('/onboarding/department')
    }

    return (
        <div className="bg-[#f9f9f9] text-[#2d3435] antialiased overflow-hidden min-h-screen">
            <main className="min-h-screen flex flex-col md:flex-row bg-[#f9f9f9] text-[#2d3435] antialiased" style={{ fontFamily: 'Lora, serif' }}>
                <OnboardingSidePanel
                    step={1}
                    title="Phase 1: Academic Standing"
                    description="We customize content based on your current year of study."
                />

                <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-10 md:p-16 min-h-screen relative shadow-2xl z-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-sm space-y-8 z-10"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b32839]">Profile Setup</p>
                            <h2 style={{ fontFamily: 'Merriweather, serif' }} className="text-3xl font-bold text-[#2d3435] tracking-tight">Academic Level</h2>
                            <p className="text-[#5a6061] text-sm font-medium">Select your current year of study to customize your experience.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={`w-full p-4 text-left border rounded-lg transition-all duration-200 flex justify-between items-center group ${selectedLevel === level
                                            ? 'border-[#2d3435] bg-[#f9f9f9] shadow-sm'
                                            : 'border-[#dde4e5] hover:border-[#2d3435]/30'
                                        }`}
                                >
                                    <span className={`text-sm font-bold ${selectedLevel === level ? 'text-[#2d3435]' : 'text-[#5a6061]'}`}>
                                        {level}
                                    </span>
                                    {selectedLevel === level && (
                                        <span className="material-symbols-outlined text-[#2d3435] text-sm">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleContinue}
                            disabled={!selectedLevel}
                            className="w-full bg-[#2d3435] text-white py-4 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1a1f20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Continue
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </motion.button>
                    </motion.div>

                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                </section>
            </main>
        </div>
    )
}

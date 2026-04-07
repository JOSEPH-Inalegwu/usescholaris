import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingSidePanel } from '../../components/onboarding/OnboardingSidePanel'
import { motion } from 'framer-motion'
import { db, auth } from '../../lib/firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useOnboarding } from '../../context/OnboardingContext'

export default function CompletePage() {
    const { data, clearData } = useOnboarding()
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleFinish = async () => {
        setIsLoading(true)
        try {
            const user = auth.currentUser
            if (user) {
                // Perform a single setDoc to save all captured metadata
                await setDoc(doc(db, 'users', user.uid), {
                    ...data,
                    hasCompletedOnboarding: true,
                    onboardingStep: 3,
                    updatedAt: new Date().toISOString()
                }, { merge: true })
                
                clearData()
                navigate('/dashboard')
            } else {
                navigate('/login')
            }
        } catch (err) {
            console.error('Error completing onboarding:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-[#f9f9f9] text-[#2d3435] antialiased overflow-hidden min-h-screen">
            <main className="min-h-screen flex flex-col md:flex-row bg-[#f9f9f9] text-[#2d3435] antialiased" style={{ fontFamily: 'Lora, serif' }}>
                <OnboardingSidePanel 
                    step={3} 
                    title="Phase 3: Finalization" 
                    description="Everything is set. Your profile is now calibrated for academic excellence."
                />

                <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-10 md:p-16 min-h-screen relative shadow-2xl z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-sm text-center space-y-8 z-10"
                    >
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-[#f2f4f4] border border-[#dde4e5] rounded-full flex items-center justify-center text-[#2d3435] shadow-sm">
                                <span className="material-symbols-outlined text-4xl">celebration</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b32839]">Profile Complete</p>
                            <h2 style={{ fontFamily: 'Merriweather, serif' }} className="text-3xl font-bold text-[#2d3435] tracking-tight">Ready to Rise?</h2>
                            <p className="text-[#5a6061] text-sm font-medium">Your academic profile is ready. You can now start competing and climbing the leaderboards.</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleFinish}
                            disabled={isLoading}
                            className="w-full bg-[#2d3435] text-white py-4 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1a1f20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Finalizing...' : 'Enter Dashboard'}
                            <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        </motion.button>
                    </motion.div>

                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                </section>
            </main>
        </div>
    )
}

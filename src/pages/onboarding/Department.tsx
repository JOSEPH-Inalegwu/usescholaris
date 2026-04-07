import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingSidePanel } from '../../components/onboarding/OnboardingSidePanel'
import { motion } from 'framer-motion'
import { useOnboarding } from '../../context/OnboardingContext'

const faculties = [
    { name: 'Faculty of Science', departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'] },
    { name: 'Faculty of Engineering', departments: ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'] },
    { name: 'Faculty of Arts', departments: ['English', 'History', 'Philosophy', 'Linguistics'] },
    { name: 'Faculty of Law', departments: ['Public Law', 'Private Law', 'Commercial Law'] },
]

export default function DepartmentPage() {
    const { data, updateData } = useOnboarding()
    const [selectedFaculty, setSelectedFaculty] = useState(data.faculty || '')
    const [selectedDept, setSelectedDept] = useState(data.department || '')
    const navigate = useNavigate()

    const handleContinue = () => {
        if (!selectedFaculty || !selectedDept) return
        updateData({ faculty: selectedFaculty, department: selectedDept })
        navigate('/onboarding/complete')
    }

    const currentFaculty = faculties.find(f => f.name === selectedFaculty)

    return (
        <div className="bg-[#f9f9f9] text-[#2d3435] antialiased overflow-hidden min-h-screen">
            <main className="min-h-screen flex flex-col md:flex-row bg-[#f9f9f9] text-[#2d3435] antialiased" style={{ fontFamily: 'Lora, serif' }}>
                <OnboardingSidePanel 
                    step={2} 
                    title="Phase 2: Academic Domain" 
                    description="This allows us to place you in the correct department and faculty leaderboards."
                />

                <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-10 md:p-16 min-h-screen relative shadow-2xl z-10 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-sm space-y-8 z-10 py-10"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b32839]">Profile Setup</p>
                            <h2 style={{ fontFamily: 'Merriweather, serif' }} className="text-3xl font-bold text-[#2d3435] tracking-tight">Department</h2>
                            <p className="text-[#5a6061] text-sm font-medium">Which academic field do you belong to?</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#5a6061] uppercase tracking-widest ml-1">Faculty</label>
                                <select 
                                    value={selectedFaculty}
                                    onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDept(''); }}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#dde4e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10 focus:bg-white transition-all text-sm text-[#2d3435] appearance-none"
                                >
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-[#5a6061] uppercase tracking-widest ml-1">Department</label>
                                <select 
                                    value={selectedDept}
                                    disabled={!selectedFaculty}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#dde4e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10 focus:bg-white transition-all text-sm text-[#2d3435] appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Department</option>
                                    {currentFaculty?.departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 px-4 py-4 border border-[#dde4e5] rounded-lg text-sm font-bold text-[#5a6061] hover:bg-[#f9f9f9] transition-all"
                            >
                                Back
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleContinue}
                                disabled={!selectedDept}
                                className="flex-[2] bg-[#2d3435] text-white py-4 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1a1f20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Continue
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                </section>
            </main>
        </div>
    )
}

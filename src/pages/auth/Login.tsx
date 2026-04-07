import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { auth, db } from '../../lib/firebase/firebase'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel'
import { motion, AnimatePresence } from 'framer-motion'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginInput = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const checkOnboardingAndNavigate = async (uid: string) => {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.hasCompletedOnboarding) {
                navigate('/dashboard')
            } else {
                // Determine step
                const step = userData.onboardingStep || 0
                if (step === 0) navigate('/onboarding/level')
                else if (step === 1) navigate('/onboarding/department')
                else if (step === 2) navigate('/onboarding/complete')
                else navigate('/onboarding/level')
            }
        } else {
            // Document doesn't exist but user authenticated (shouldn't happen with email register, but maybe google)
            await setDoc(doc(db, 'users', uid), {
                uid,
                hasCompletedOnboarding: false,
                onboardingStep: 0,
                createdAt: serverTimestamp()
            })
            navigate('/onboarding/level')
        }
    }

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true)
        setError(null)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
            await checkOnboardingAndNavigate(userCredential.user.uid)
        } catch (err: any) {
            const code = err?.code
            if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
                setError('No account found with these credentials. Please check your details or create an account.')
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.')
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a few minutes and try again.')
            } else {
                setError(err.message || 'Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        setError(null)
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            await checkOnboardingAndNavigate(result.user.uid)
        } catch (err: any) {
            const code = err?.code
            if (code === 'auth/popup-closed-by-user') {
                setError('Sign in was cancelled.')
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a few minutes and try again.')
            } else {
                setError(err.message || 'Failed to sign in with Google.')
            }
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="bg-[#f9f9f9] text-[#2d3435] antialiased overflow-hidden min-h-screen">
            <main className="min-h-screen flex flex-col md:flex-row bg-[#f9f9f9] text-[#2d3435] antialiased" style={{ fontFamily: 'Lora, serif' }}>

                {/* Left Section — 50% */}
                <AuthLeftPanel />

                {/* Right Section — 50% */}
                <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-10 md:p-16 min-h-screen relative shadow-2xl z-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-sm space-y-8 z-10"
                    >
                        <div className="space-y-1">
                            <h2 style={{ fontFamily: 'Merriweather, serif' }} className="text-3xl font-bold text-[#2d3435] tracking-tight">Welcome back</h2>
                            <p style={{ fontFamily: 'Lora, serif' }} className="text-[#5a6061] text-sm font-medium">Sign in to continue your academic journey.</p>
                        </div>

                        {/* Google */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full flex items-center justify-center gap-3 px-5 py-4 border border-[#dde4e5] rounded-lg hover:bg-[#f9f9f9] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group shadow-sm"
                        >
                            {isGoogleLoading ? (
                                <svg className="animate-spin w-5 h-5 text-[#5a6061]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            <span style={{ fontFamily: 'Lora, serif' }} className="text-sm font-bold text-[#2d3435]">
                                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                            </span>
                        </motion.button>

                        {/* Divider */}
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-[#dde4e5]" />
                            <span className="flex-shrink mx-4 text-[#adb3b4] text-[10px] uppercase tracking-widest font-bold">or</span>
                            <div className="flex-grow border-t border-[#dde4e5]" />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 rounded-sm bg-red-50 border border-red-100 text-red-700 text-xs font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-[#5a6061] uppercase tracking-widest ml-1" htmlFor="email">
                                    Institutional Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="scholar@university.edu"
                                    {...register('email')}
                                    disabled={isLoading || isGoogleLoading}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#dde4e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10 focus:bg-white transition-all text-sm text-[#2d3435] placeholder:text-[#adb3b4]/60 disabled:opacity-60"
                                />
                                {errors.email && <p className="text-xs text-red-600 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[11px] font-bold text-[#5a6061] uppercase tracking-widest" htmlFor="password">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" style={{ fontFamily: 'Lora, serif' }} className="text-[11px] font-bold text-[#b32839] hover:underline uppercase tracking-wider">Forgot?</Link>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    disabled={isLoading || isGoogleLoading}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#dde4e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10 focus:bg-white transition-all text-sm text-[#2d3435] placeholder:text-[#adb3b4]/60 disabled:opacity-60"
                                />
                                {errors.password && <p className="text-xs text-red-600 ml-1">{errors.password.message}</p>}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isLoading || isGoogleLoading}
                                className="w-full bg-[#2d3435] text-white py-4 rounded-lg text-sm font-bold shadow-sm hover:bg-[#1a1f20] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign in to Scholaris'}
                            </motion.button>
                        </form>

                        <p style={{ fontFamily: 'Lora, serif' }} className="text-xs text-center text-[#adb3b4] font-medium pt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#2d3435] font-bold hover:text-[#b32839] underline underline-offset-4 transition-colors">
                                Register
                            </Link>
                        </p>
                    </motion.div>

                    {/* Background Decorative Blur */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-[#f2f4f4] rounded-full blur-3xl opacity-50"></div>
                </section>
            </main>
        </div>
    )
}

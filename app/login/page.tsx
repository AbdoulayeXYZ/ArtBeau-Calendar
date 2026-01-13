'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle,
    Sparkles
} from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                router.push('/calendrier');
            } else {
                const data = await response.json();
                setError(data.error || 'Identifiants incorrects');
            }
        } catch {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] transition-colors duration-500">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        rotate: [0, -120, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px]"
                />
                {/* Mesh Gradient Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
            </div>

            <main className="w-full max-w-lg px-6 relative z-10 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Brand Header */}
                    <div className="flex flex-col items-center mb-12">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative w-32 h-32 mb-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex items-center justify-center ring-1 ring-white/20"
                        >
                            <Image
                                src="/iconlogo.png"
                                alt="Art'Beau"
                                width={100}
                                height={100}
                                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                priority
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-2 -right-2 p-2 bg-primary rounded-xl shadow-lg shadow-primary/40"
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                            </motion.div>
                        </motion.div>

                        <div className="text-center space-y-1">
                            <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
                                Art&apos;Beau <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Calendar</span>
                            </h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Art&apos;Beau Rescence Portfolio</p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-[#1a1a1a]/80 backdrop-blur-3xl rounded-[2.8rem] p-10 sm:p-12 border border-white/10 shadow-3xl">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-white tracking-tight mb-2 italic">Connectez-vous</h2>
                                <p className="text-sm text-slate-500 font-medium">Bienvenue dans l&apos;espace collaborateur</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence mode='wait'>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-red-500/10 text-red-400 p-5 rounded-3xl flex items-start gap-4 border border-red-500/20"
                                        >
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-bold">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Identifiant"
                                            className="w-full pl-16 pr-8 py-6 bg-white/5 border-2 border-transparent rounded-[2rem] focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-slate-600 text-lg shadow-inner"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Secret Code"
                                            className="w-full pl-16 pr-8 py-6 bg-white/5 border-2 border-transparent rounded-[2rem] focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-slate-600 text-lg shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-4 group/btn"
                                >
                                    {loading ? (
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                    ) : (
                                        <>
                                            Entrer maintenant
                                            <div className="p-2 bg-white/20 rounded-full group-hover/btn:translate-x-1 transition-transform">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Footer Text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1 }}
                        className="text-center mt-12 text-[10px] font-black text-white uppercase tracking-[0.5em] opacity-30"
                    >
                        Secure Corporate Access • 2026 Edition
                    </motion.p>
                </motion.div>
            </main>
        </div>
    );
}

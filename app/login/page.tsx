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
    ShieldCheck,
    Shapes
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[100px]"
                />
            </div>

            <main className="w-full max-w-md px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Header Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="relative w-24 h-24 mb-6"
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl animate-pulse" />
                            <div className="relative glass rounded-[2rem] p-4 flex items-center justify-center shadow-2xl border-white ring-8 ring-white/50">
                                <Image
                                    src="/iconlogo.png"
                                    alt="Art'Beau"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter text-center">
                            Pro-<span className="text-primary italic">Calendar</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Art&apos;Beau Rescence</p>
                    </div>

                    {/* Main Form Card */}
                    <div className="glass-dark border-white/10 p-1 bg-slate-900/95 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-slate-900/40">
                        <div className="bg-white rounded-[2.2rem] p-8 sm:p-10 space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Espace Collaborateur</h2>
                                <p className="text-sm text-slate-400 font-medium">Connectez-vous pour voir le planning équipe.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence mode='wait'>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100"
                                        >
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-bold leading-tight">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-5">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Nom d'utilisateur"
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mot de passe"
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Continuer
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer Badges */}
                    <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shapes className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">v3.0 Grid</span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

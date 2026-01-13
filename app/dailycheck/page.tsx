'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudSun,
    Sun,
    CloudRain,
    Zap,
    Plus,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Save,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyCheckData {
    id: number;
    hier: string;
    aujourdhui: string;
    blocages: string;
    meteo: number;
    createdAt: string;
    user: {
        id: number;
        nom: string;
        prenom: string;
        username: string;
    };
}

interface UserSummary {
    id: number;
    nom: string;
    prenom: string;
    username: string;
}

export default function DailyCheckPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checks, setChecks] = useState<DailyCheckData[]>([]);
    const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [hier, setHier] = useState(['', '', '']);
    const [aujourdhui, setAujourdhui] = useState(['', '', '']);
    const [blocages, setBlocages] = useState('');
    const [meteo, setMeteo] = useState(80);

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Fetch user error:', error);
            router.push('/login');
        }
    }, [router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dailycheck');
            if (response.ok) {
                const data = await response.json();
                setChecks(data.checks);
                setAllUsers(data.allUsers);
            }
        } catch (error) {
            console.error('Fetch daily checks error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
        fetchData();
    }, [fetchUser, fetchData]);

    const hasSubmittedToday = checks.some(c => c.user.id === user?.id);
    const teamAverageMeteo = checks.length > 0
        ? Math.round(checks.reduce((acc, curr) => acc + curr.meteo, 0) / checks.length)
        : 0;



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const hierStr = hier.filter(b => b.trim() !== '').join(' • ');
        const aujourdhuiStr = aujourdhui.filter(b => b.trim() !== '').join(' • ');
        const blocagesStr = blocages.trim() || 'Aucun';

        try {
            const response = await fetch('/api/dailycheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hier: hierStr,
                    aujourdhui: aujourdhuiStr,
                    blocages: blocagesStr,
                    meteo
                }),
            });

            if (response.ok) {
                setShowForm(false);
                fetchData();
                // Reset form
                setHier(['', '', '']);
                setAujourdhui(['', '', '']);
                setBlocages('');
                setMeteo(80);
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la soumission');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Erreur réseau');
        } finally {
            setSubmitting(false);
        }
    };

    const getMeteoIcon = (value: number) => {
        if (value >= 80) return <Sun className="w-6 h-6 text-amber-500" />;
        if (value >= 50) return <CloudSun className="w-6 h-6 text-slate-400" />;
        if (value >= 25) return <CloudRain className="w-6 h-6 text-blue-400" />;
        return <Zap className="w-6 h-6 text-purple-500" />;
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-500 pb-32">
            <Navbar user={user} />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-8">
                {/* Brand Header */}
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Team <span className="text-primary">Climate</span>
                        </h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sync with your squad</p>
                    </motion.div>
                </div>

                {/* Team Status Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-colors" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Ambiance Global</p>
                                <h3 className="text-5xl font-black tracking-tighter">{teamAverageMeteo}%</h3>
                            </div>
                            <div className="flex -space-x-3">
                                {allUsers.slice(0, 6).map(u => (
                                    <div key={u.username} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border-2 border-slate-900 flex items-center justify-center text-[10px] font-black uppercase">
                                        {u.prenom[0]}
                                    </div>
                                ))}
                                {allUsers.length > 6 && (
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[10px] font-black">
                                        +{allUsers.length - 6}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                            {getMeteoIcon(teamAverageMeteo)}
                        </div>
                    </div>
                </motion.div>

                {/* Action Section */}
                <AnimatePresence mode="wait">
                    {!hasSubmittedToday ? (
                        !showForm ? (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => setShowForm(true)}
                                className="w-full bg-primary hover:bg-primary/90 text-white p-6 rounded-[2rem] shadow-xl shadow-primary/20 flex items-center justify-between group overflow-hidden relative"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-black tracking-tight leading-none">Faire mon check</p>
                                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-1">Sync now • 2 min</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-primary/20 p-8 shadow-2xl"
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Nouveau Check</h3>
                                        <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hier (Accomplissements)</label>
                                                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">3 Max</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {hier.map((val, idx) => (
                                                    <div key={`hier-${idx}`} className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
                                                        <input
                                                            value={val}
                                                            onChange={(e) => {
                                                                const newHier = [...hier];
                                                                newHier[idx] = e.target.value;
                                                                setHier(newHier);
                                                            }}
                                                            placeholder={idx === 0 ? "Ex: Terminé le design du Navbar" : "Optionnel..."}
                                                            className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/30 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aujourd&apos;hui (Objectifs)</label>
                                                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">3 Max</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {aujourdhui.map((val, idx) => (
                                                    <div key={`auj-${idx}`} className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/40 group-focus-within:bg-emerald-400 transition-colors" />
                                                        <input
                                                            value={val}
                                                            onChange={(e) => {
                                                                const newAuj = [...aujourdhui];
                                                                newAuj[idx] = e.target.value;
                                                                setAujourdhui(newAuj);
                                                            }}
                                                            placeholder={idx === 0 ? "Ex: Implémenter les bullet points" : "Optionnel..."}
                                                            className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blocages</label>
                                            <input
                                                value={blocages}
                                                onChange={(e) => setBlocages(e.target.value)}
                                                placeholder="Des freins ? (Laisser vide pour 'Aucun')"
                                                className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/30 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma Météo: <span className="text-primary">{meteo}%</span></span>
                                                {getMeteoIcon(meteo)}
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={meteo}
                                                onChange={(e) => setMeteo(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-white py-5 rounded-2xl font-black text-base shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                        Finaliser mon check
                                    </button>
                                </form>
                            </motion.div>
                        )
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-black text-emerald-900 dark:text-emerald-400 leading-none">Check terminé</p>
                                    <p className="text-[10px] uppercase font-bold text-emerald-600 mt-1">À demain pour la suite</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feed Section */}
                <div className="space-y-6 pb-20">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Feed Équipe</h3>
                    <div className="space-y-4">
                        {checks.map((check) => (
                            <motion.div
                                key={check.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl font-black text-slate-400 uppercase">
                                            {check.user.prenom[0]}{check.user.nom[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg text-slate-900 dark:text-white leading-none capitalize">{check.user.prenom}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {format(new Date(check.createdAt), 'HH:mm', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                                        {getMeteoIcon(check.meteo)}
                                        <span className="text-xs font-black text-primary">{check.meteo}%</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Achievements</p>
                                        <div className="space-y-1.5">
                                            {check.hier.split(' • ').map((item, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-tight italic">
                                                        {item}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Focus Today</p>
                                            <div className="space-y-2">
                                                {check.aujourdhui.split(' • ').map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                            {item}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Blockers</p>
                                            <p className={cn(
                                                "text-sm font-bold leading-tight",
                                                check.blocages.toLowerCase() === 'aucun' ? "text-slate-400" : "text-rose-600"
                                            )}>
                                                {check.blocages}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

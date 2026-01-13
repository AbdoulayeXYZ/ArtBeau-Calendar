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
    Clock,
    User
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
    const [hier, setHier] = useState('');
    const [aujourdhui, setAujourdhui] = useState('');
    const [blocages, setBlocages] = useState('Aucun');
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

    const hasSubmittedToday = useMemo(() => {
        return checks.some(c => c.user.username === user?.username);
    }, [checks, user?.username]);

    const teamAverageMeteo = useMemo(() => {
        if (checks.length === 0) return 0;
        const sum = checks.reduce((acc, curr) => acc + curr.meteo, 0);
        return Math.round(sum / checks.length);
    }, [checks]);

    const notSubmittedUsers = useMemo(() => {
        const submittedUsernames = new Set(checks.map(c => c.user.username));
        return allUsers.filter(u => !submittedUsernames.has(u.username));
    }, [allUsers, checks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('/api/dailycheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hier, aujourdhui, blocages, meteo }),
            });

            if (response.ok) {
                setShowForm(false);
                fetchData();
                // Reset form
                setHier('');
                setAujourdhui('');
                setBlocages('Aucun');
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
        <div className="min-h-screen pb-24 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500">
            <Navbar user={user} />

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Team Climate Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Team <span className="text-primary">Climate</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {format(new Date(), "EEEE d MMMM", { locale: fr })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <span className="text-3xl font-black text-primary block leading-none">{teamAverageMeteo}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Avg</span>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                {getMeteoIcon(teamAverageMeteo)}
                            </div>
                        </div>
                    </div>

                    {/* Pending participants summary */}
                    {notSubmittedUsers.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">En attente ({notSubmittedUsers.length})</h3>
                            <div className="flex flex-wrap gap-2">
                                {notSubmittedUsers.map(u => (
                                    <div key={u.username} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{u.prenom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Submit Action or Status */}
                {!hasSubmittedToday && !showForm && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowForm(true)}
                        className="w-full bg-slate-900 dark:bg-primary text-white p-5 rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-between group overflow-hidden relative"
                    >
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block text-lg font-black tracking-tight leading-none">Faire mon check</span>
                                <span className="text-xs text-white/60 font-medium">Moins de 2 minutes</span>
                            </div>
                        </div>
                        <div className="relative z-10 p-2 bg-white/20 rounded-full group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                    </motion.button>
                )}

                {/* Form Section */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-primary/20 shadow-xl"
                        >
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Daily Check</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                                    >
                                        Fermer
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hier (Réalisations)</label>
                                        <textarea
                                            required
                                            value={hier}
                                            onChange={(e) => setHier(e.target.value)}
                                            placeholder="Qu'as-tu accompli hier ?"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Aujourd&apos;hui (Objectifs)</label>
                                        <textarea
                                            required
                                            value={aujourdhui}
                                            onChange={(e) => setAujourdhui(e.target.value)}
                                            placeholder="Tes priorités pour aujourd'hui ?"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blocages</label>
                                        <input
                                            required
                                            value={blocages}
                                            onChange={(e) => setBlocages(e.target.value)}
                                            placeholder="Des obstacles ?"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma Météo : {meteo}%</label>
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
                                        <div className="flex justify-between text-[10px] px-1 font-bold text-slate-400">
                                            <span>Bof (0%)</span>
                                            <span>Neutre</span>
                                            <span>Top (100%)</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer mon check'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Team Checks Feed */}
                <div className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Aujourd&apos;hui ({checks.length})</h2>
                    </div>

                    <div className="grid gap-4">
                        {checks.map((check) => (
                            <motion.div
                                key={check.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
                            >
                                {/* Time marker */}
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-500">{format(new Date(check.createdAt), 'HH:mm')}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xl font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        {check.user.prenom[0]}{check.user.nom[0]}
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white leading-none mb-1">
                                            {check.user.prenom} {check.user.nom}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-md">
                                                {getMeteoIcon(check.meteo)}
                                                <span className="text-[10px] font-black text-primary">{check.meteo}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fait Hier</h4>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-100/50 dark:border-slate-800/50 italic">
                                            &ldquo;{check.hier}&rdquo;
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Objectifs Aujourd&apos;hui</h4>
                                            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl text-sm font-medium text-emerald-900 dark:text-emerald-300 border border-emerald-500/10">
                                                {check.aujourdhui}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blocages</h4>
                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm font-medium border",
                                                check.blocages.toLowerCase() === 'aucun'
                                                    ? "bg-slate-50 dark:bg-slate-800/30 text-slate-500 border-slate-100/50 dark:border-slate-800/50"
                                                    : "bg-rose-50/50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10"
                                            )}>
                                                {check.blocages}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {checks.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <User className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Pas encore de checks</h3>
                                <p className="text-sm text-slate-500">Sois le premier à partager ton avancement !</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

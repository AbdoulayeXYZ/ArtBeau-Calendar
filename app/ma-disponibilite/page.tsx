'use client';

import { useEffect, useState, useMemo, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    Trash2,
    ChevronLeft,
    Save,
    Loader2,
    BedDouble,
    LogOut,
    X,
    Calendar,
    Clock,
    Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useViewport } from '@/hooks/useViewport';

export default function MaDisponibilitePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ nom: string; prenom: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [existingAvailabilities, setExistingAvailabilities] = useState<any[]>([]);

    // Form state
    const [selectionMode, setSelectionMode] = useState<'jour' | 'semaine' | 'mois'>('jour');
    const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
    const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
    const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'moyennement'>('disponible');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [logeBg, setLogeBg] = useState(false);

    // Mobile tab state
    const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            console.error('Fetch user error:', error);
            router.push('/login');
        }
    }, [router]);

    const fetchMyAvailability = useCallback(async () => {
        try {
            const response = await fetch('/api/availability');
            if (response.ok) {
                const data = await response.json();
                setExistingAvailabilities(data.availability.filter((a: any) => a.user.username === user?.username));
            }
        } catch (error) {
            console.error('Fetch availability error:', error);
        }
    }, [user?.username]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            fetchMyAvailability();
        }
    }, [user, fetchMyAvailability]);

    useEffect(() => {
        const debut = new Date(dateDebut);
        let fin = new Date(dateDebut);

        if (selectionMode === 'semaine') {
            fin = addDays(debut, 6);
        } else if (selectionMode === 'mois') {
            fin = endOfMonth(debut);
        }

        setDateFin(fin.toISOString().split('T')[0]);
    }, [dateDebut, selectionMode]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(null);

        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodeType: selectionMode,
                    dateDebut,
                    dateFin,
                    statut,
                    horaireText: `${startTime} - ${endTime}`,
                    logeBg,
                }),
            });

            if (!response.ok) throw new Error('Sauvegarde échouée');

            setSuccess('Disponibilité enregistrée !');
            fetchMyAvailability();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous supprimer ce créneau ?')) return;

        try {
            const response = await fetch(`/api/availability?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Suppression échouée');

            setSuccess('Créneau supprimé');
            fetchMyAvailability();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Erreur lors de la suppression');
        }
    };

    // Viewport detection (must be before any conditional returns)
    const { isMobile } = useViewport();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 text-xs">
            <Navbar user={user} />

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full max-w-[1700px] mx-auto">
                {/* MOBILE TABS */}
                {isMobile && (
                    <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('form')}
                                className={cn(
                                    "flex-1 py-4 px-6 font-bold text-sm transition-colors relative",
                                    activeTab === 'form'
                                        ? "text-primary dark:text-primary"
                                        : "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                Ajouter
                                {activeTab === 'form' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('list')}
                                className={cn(
                                    "flex-1 py-4 px-6 font-bold text-sm transition-colors relative",
                                    activeTab === 'list'
                                        ? "text-primary dark:text-primary"
                                        : "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                Mes Créneaux ({existingAvailabilities.length})
                                {activeTab === 'list' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* LEFT COLUMN: Compact Form (Fixed Width on Desktop) */}
                <div className={cn(
                    "w-full lg:w-[360px] flex-none flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 lg:h-full",
                    isMobile && activeTab === 'list' && "hidden"
                )}>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <ChevronLeft className="w-4 h-4 text-slate-500" />
                            </button>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">
                                Ma <span className="text-primary">Dispo.</span>
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Status Selector - Compact */}
                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                {[
                                    { id: 'disponible', label: 'Dispo', color: 'emerald', icon: CheckCircle2 },
                                    { id: 'moyennement', label: 'Partiel', color: 'amber', icon: AlertCircle },
                                    { id: 'indisponible', label: 'Absent', color: 'rose', icon: X }
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setStatut(s.id as any)}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1",
                                            statut === s.id
                                                ? `bg-white dark:bg-slate-700 text-${s.color}-600 dark:text-${s.color}-400 shadow-sm`
                                                : "text-slate-400 dark:text-slate-500"
                                        )}
                                    >
                                        <s.icon className="w-3 h-3" />
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mode & Dates */}
                            <div className="space-y-3">
                                <div className="flex gap-1">
                                    {['jour', 'semaine', 'mois'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setSelectionMode(m as any)}
                                            className={cn(
                                                "flex-1 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                                selectionMode === m
                                                    ? "bg-primary/10 border-primary/20 text-primary"
                                                    : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Début</label>
                                        <input
                                            type="date"
                                            value={dateDebut}
                                            onChange={(e) => setDateDebut(e.target.value)}
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:border-primary outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Fin</label>
                                        <input
                                            type="date"
                                            value={dateFin}
                                            readOnly={selectionMode !== 'jour'}
                                            onChange={(e) => selectionMode === 'jour' && setDateFin(e.target.value)}
                                            className={cn(
                                                "w-full p-2 border rounded-lg text-xs font-bold outline-none",
                                                selectionMode === 'jour'
                                                    ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    : "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-400 cursor-not-allowed"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time - Compact */}
                            <div className="bg-slate-900 dark:bg-black rounded-xl p-3 text-white relative overflow-hidden">
                                <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="text-center">
                                        <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-0.5">Arrivée</span>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="bg-transparent border-none text-xl font-black text-white p-0 w-20 text-center focus:ring-0"
                                        />
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-center">
                                        <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-0.5">Départ</span>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="bg-transparent border-none text-xl font-black text-white p-0 w-20 text-center focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sleeper Toggle - Compact */}
                            <button
                                type="button"
                                onClick={() => setLogeBg(!logeBg)}
                                className={cn(
                                    "w-full p-2 rounded-xl border flex items-center gap-3 transition-colors",
                                    logeBg ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", logeBg ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                    <BedDouble className="w-4 h-4" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={cn("font-bold text-xs", logeBg ? "text-primary" : "text-slate-600 dark:text-slate-400")}>Dortoir sur place</p>
                                </div>
                                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", logeBg ? "border-primary bg-primary" : "border-slate-300")}>
                                    {logeBg && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-slate-900 dark:bg-primary hover:bg-black dark:hover:bg-primary/90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Confirm.
                            </button>
                        </form>
                    </div>

                    {/* Footer User Info */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                {user?.prenom[0]}{user?.nom[0]}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{user?.prenom} {user?.nom}</p>
                                <button className="text-[9px] text-slate-400 hover:text-rose-500 uppercase tracking-wider font-bold flex items-center gap-1">
                                    <LogOut className="w-3 h-3" /> Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Scrollable List */}
                <div className={cn(
                    "flex-1 bg-slate-50/30 dark:bg-slate-950/50 overflow-y-auto custom-scrollbar p-4 lg:p-6 pb-20 lg:pb-6",
                    isMobile && activeTab === 'form' && "hidden"
                )}>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Vos Créneaux ({existingAvailabilities.length})</h3>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {existingAvailabilities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {existingAvailabilities.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                        >
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1",
                                                item.statut === 'disponible' ? "bg-emerald-500" :
                                                    item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500"
                                            )} />

                                            <div className="pl-3 flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                            item.statut === 'disponible' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                                                item.statut === 'moyennement' ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                                        )}>
                                                            {item.statut.slice(0, 4)}.
                                                        </span>
                                                        {item.logeBg && <BedDouble className="w-3 h-3 text-primary" />}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {format(new Date(item.dateDebut), 'dd MMM', { locale: fr })}
                                                        {item.dateDebut !== item.dateFin && ` - ${format(new Date(item.dateFin), 'dd MMM', { locale: fr })}`}
                                                    </p>
                                                    <p className="text-[10px] font-mono text-slate-500">{item.horaireText}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                    <CalendarIcon className="w-10 h-10 text-slate-300 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">Aucun planning</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Success Toast */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


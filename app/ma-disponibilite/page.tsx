'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    Trash2,
    Save,
    Loader2,
    BedDouble,
    X,
    Calendar
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
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-500 pb-32">
            <Navbar user={user} />

            <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 lg:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col gap-2 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Gérer ma <span className="text-primary">Dispo</span>
                        </h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Update your team availability</p>
                    </motion.div>
                </div>

                {/* Mobile Tabs */}
                {isMobile ? (
                    <div className="mb-8">
                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-2">
                            <button
                                onClick={() => setActiveTab('form')}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeTab === 'form' ? "bg-slate-900 dark:bg-primary text-white" : "text-slate-400"
                                )}
                            >
                                Ajouter
                            </button>
                            <button
                                onClick={() => setActiveTab('list')}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeTab === 'list' ? "bg-slate-900 dark:bg-primary text-white" : "text-slate-400"
                                )}
                            >
                                Liste ({existingAvailabilities.length})
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <motion.div
                        className={cn(
                            "flex-1 lg:max-w-md",
                            isMobile && activeTab === 'list' && "hidden"
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Type Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Période</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['jour', 'semaine', 'mois'].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setSelectionMode(m as any)}
                                                className={cn(
                                                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                                    selectionMode === m
                                                        ? "bg-primary border-primary text-white"
                                                        : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">État</label>
                                    <div className="grid grid-cols-3 gap-2">
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
                                                    "flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all",
                                                    statut === s.id
                                                        ? `border-${s.color}-500 bg-${s.color}-50/50 dark:bg-${s.color}-500/10 text-${s.color}-600`
                                                        : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400"
                                                )}
                                            >
                                                <s.icon className="w-5 h-5" />
                                                <span className="text-[10px] font-black uppercase">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Début</label>
                                        <input
                                            type="date"
                                            value={dateDebut}
                                            onChange={(e) => setDateDebut(e.target.value)}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-black outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fin</label>
                                        <input
                                            type="date"
                                            value={dateFin}
                                            readOnly={selectionMode !== 'jour'}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-sm font-black opacity-50 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Hours - Premium Card */}
                                <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-6 text-white relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="text-center flex-1">
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2">Entrée</span>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="bg-transparent border-none text-2xl font-black text-white p-0 w-full text-center focus:ring-0"
                                            />
                                        </div>
                                        <div className="w-px h-12 bg-white/10 mx-4" />
                                        <div className="text-center flex-1">
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2">Sortie</span>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="bg-transparent border-none text-2xl font-black text-white p-0 w-full text-center focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dormitory */}
                                <div
                                    onClick={() => setLogeBg(!logeBg)}
                                    className={cn(
                                        "p-5 rounded-[1.8rem] border-2 flex items-center justify-between cursor-pointer transition-all",
                                        logeBg ? "border-primary bg-primary/5" : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", logeBg ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-400")}>
                                            <BedDouble className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className={cn("font-black text-sm tracking-tight", logeBg ? "text-primary" : "text-slate-600 dark:text-slate-200")}>Dortoir sur place</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logement loge-background</p>
                                        </div>
                                    </div>
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", logeBg ? "bg-primary border-primary" : "border-slate-200")}>
                                        {logeBg && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-slate-900 dark:bg-primary hover:scale-[1.02] active:scale-[0.98] text-white py-5 rounded-[1.8rem] font-black text-base shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    Enregistrer
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* List Section */}
                    <div className={cn(
                        "flex-1 space-y-4",
                        isMobile && activeTab === 'form' && "hidden"
                    )}>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mes Créneaux</h3>
                        <AnimatePresence mode="popLayout">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {existingAvailabilities.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 relative overflow-hidden group shadow-sm"
                                    >
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1.5",
                                            item.statut === 'disponible' ? "bg-emerald-500" :
                                                item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500"
                                        )} />

                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                                        item.statut === 'disponible' ? "bg-emerald-50 text-emerald-600" :
                                                            item.statut === 'moyennement' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        {item.statut === 'disponible' ? 'Actif' : item.statut === 'moyennement' ? 'Partiel' : 'Absent'}
                                                    </span>
                                                    {item.logeBg && <span className="p-1 px-2 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase">Dortoir</span>}
                                                </div>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                    {format(new Date(item.dateDebut), 'dd MMMM', { locale: fr })}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.horaireText}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                        {existingAvailabilities.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-[2.5rem]">
                                <Calendar className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-black uppercase tracking-widest text-[10px]">Aucune donnée</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-28 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-80 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-black tracking-tight">{success}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


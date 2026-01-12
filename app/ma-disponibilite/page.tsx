'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Trash2,
    ChevronLeft,
    Save,
    Loader2,
    BedDouble,
    LogOut,
    Calendar as CalendarIcon,
    X,
    Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar user={user} />

            <main className="max-w-[1200px] mx-auto px-4 py-6 lg:py-16">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-20">

                    {/* LEFT COLUMN: Clean Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="xl:col-span-7 space-y-8 lg:space-y-10"
                    >
                        <div className="space-y-4">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 font-bold text-xs uppercase tracking-widest"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Retour
                            </button>
                            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                                Ma <span className="text-primary font-bold">Disponibilité</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-base lg:text-lg">Indiquez vos disponibilités pour que l&apos;équipe puisse s&apos;organiser.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-6 lg:p-12 space-y-8 lg:space-y-12">

                            {/* Statue & Details Header */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-1 bg-slate-50 rounded-[2rem]">
                                {[
                                    { id: 'disponible', label: 'Disponible', color: 'emerald', icon: CheckCircle2 },
                                    { id: 'moyennement', label: 'Partiel', color: 'amber', icon: AlertCircle },
                                    { id: 'indisponible', label: 'Absent', color: 'rose', icon: X }
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setStatut(s.id as any)}
                                        className={cn(
                                            "flex-1 w-full flex items-center justify-center gap-3 py-4 rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all",
                                            statut === s.id
                                                ? `bg-white text-${s.color}-600 shadow-xl`
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <s.icon className={cn("w-5 h-5", statut === s.id ? `text-${s.color}-500` : "text-slate-300")} />
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            {/* Main Content Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Période Selection */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Période du planning</label>
                                    </div>

                                    <div className="p-2 bg-slate-50 rounded-3xl flex gap-1 mb-4">
                                        {['jour', 'semaine', 'mois'].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setSelectionMode(m as any)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectionMode === m ? "bg-white text-primary shadow-lg" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="group relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Début</span>
                                            <input
                                                type="date"
                                                value={dateDebut}
                                                onChange={(e) => setDateDebut(e.target.value)}
                                                className="w-full pl-20 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-800"
                                                required
                                            />
                                        </div>
                                        <div className="group relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Fin</span>
                                            <input
                                                type="date"
                                                value={dateFin}
                                                readOnly={selectionMode !== 'jour'}
                                                className={cn(
                                                    "w-full pl-20 pr-6 py-5 border-2 rounded-3xl font-bold outline-none transition-all",
                                                    selectionMode === 'jour'
                                                        ? "bg-slate-50 border-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-800"
                                                        : "bg-slate-100 border-slate-100 text-slate-300"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hours Selection */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-secondary" />
                                        </div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Plage horaire</label>
                                    </div>

                                    <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 text-white space-y-6 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
                                        <div className="relative z-10 flex flex-col gap-4 lg:gap-6">
                                            <div className="flex items-center justify-between">
                                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-transparent border-none text-xl lg:text-2xl font-black text-white focus:ring-0 p-0 w-20 lg:w-24" />
                                                <div className="h-px w-6 lg:w-8 bg-white/20" />
                                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-transparent border-none text-xl lg:text-2xl font-black text-white focus:ring-0 p-0 w-20 lg:w-24 text-right" />
                                            </div>
                                            <div className="flex justify-between text-[8px] lg:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                                <span>Arrivée</span>
                                                <span>Départ</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sleeper Option (Clarified!) */}
                                    <button
                                        type="button"
                                        onClick={() => setLogeBg(!logeBg)}
                                        className={cn(
                                            "w-full p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all group",
                                            logeBg ? "border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", logeBg ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100")}>
                                                <BedDouble className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-sm tracking-tight leading-none mb-1">Dortoir (BG)</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Je loge sur place</p>
                                            </div>
                                        </div>
                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", logeBg ? "bg-primary border-primary scale-110" : "border-slate-200")}>
                                            <AnimatePresence>
                                                {logeBg && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-3xl font-black text-xl transition-all shadow-2xl hover:shadow-slate-900/40 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    Confirmer mon planning
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* RIGHT COLUMN: Redesigned Plannings Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="xl:col-span-5 space-y-8"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Mes <span className="text-primary font-bold">Plannings</span>
                            </h3>
                            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {existingAvailabilities.length} Créneaux
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                {existingAvailabilities.length > 0 ? (
                                    existingAvailabilities.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                            className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-white transition-all duration-300"
                                        >
                                            {/* Status Badge Side */}
                                            <div className={cn(
                                                "absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-12 rounded-r-full",
                                                item.statut === 'disponible' ? "bg-emerald-500" :
                                                    item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500"
                                            )} />

                                            <div className="flex justify-between items-start pl-4">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                            item.statut === 'disponible' ? "bg-emerald-50 text-emerald-600" :
                                                                item.statut === 'moyennement' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {item.statut}
                                                        </div>
                                                        {item.logeBg && (
                                                            <div className="flex items-center gap-1.5 text-secondary font-black text-[9px] uppercase tracking-widest">
                                                                <BedDouble className="w-3 h-3" />
                                                                Dortoir
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Du au</span>
                                                            <p className="font-black text-slate-900 text-lg tracking-tight">
                                                                {format(new Date(item.dateDebut), 'dd MMM', { locale: fr })}
                                                                <span className="mx-2 text-slate-200">—</span>
                                                                {format(new Date(item.dateFin), 'dd MMM', { locale: fr })}
                                                            </p>
                                                        </div>
                                                        <div className="h-8 w-px bg-slate-100" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Horaire</span>
                                                            <p className="font-bold text-slate-600">
                                                                {item.horaireText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 gap-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            <CalendarIcon className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun planning</p>
                                            <p className="text-slate-300 text-[10px] font-bold">Vos créneaux apparaîtront ici.</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Motivational Box */}
                        <div className="p-8 bg-gradient-to-br from-primary to-teal-400 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                                <Smile className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-lg tracking-tight leading-none">Bon travail {user?.prenom} !</p>
                                <p className="text-white/70 text-xs font-medium">Votre rigueur aide toute l&apos;équipe.</p>
                            </div>
                        </div>

                        <button className="w-full py-4 flex items-center justify-center gap-3 text-slate-400 font-bold hover:text-slate-900 transition-colors group">
                            Déconnexion sécurisée
                            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </motion.div>
                </div>
            </main>

            {/* Success Notification */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className="bg-slate-900 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 ring-[10px] ring-black/5">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">{success}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

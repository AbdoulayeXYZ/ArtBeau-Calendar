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
    CalendarRange,
    CalendarDays,
    X,
    Bed,
    Moon,
    ChevronRight
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
                const myData = data.availability.filter((a: any) => a.user.username === user?.username);
                myData.sort((a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
                setExistingAvailabilities(myData);
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

            setSuccess('Disponibilité enregistrée');
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
        if (!confirm('Souhaitez-vous supprimer cette déclaration ?')) return;

        try {
            const response = await fetch(`/api/availability?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Suppression échouée');

            setSuccess('Déclaration supprimée');
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
                <Loader2 className="w-12 h-12 text-primary animate-spin opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <Navbar user={user} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-16"
                    >
                        <header className="space-y-6">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all font-bold text-sm group"
                            >
                                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                Retour au tableau
                            </button>
                            <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                Ma <span className="text-primary italic">Disponibilité</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md">
                                Gérez vos présences et dortoirs avec précision et élégance.
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-16">

                            <div className="space-y-10">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-4">
                                    <span className="w-8 h-px bg-slate-100"></span>
                                    01. Type & Statut
                                </h2>

                                <div className="space-y-8">
                                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                                        {[
                                            { id: 'jour', label: 'Quotidien', icon: Calendar },
                                            { id: 'semaine', label: 'Hebdo', icon: CalendarRange },
                                            { id: 'mois', label: 'Mensuel', icon: CalendarDays }
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectionMode(m.id as any)}
                                                className={cn(
                                                    "px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-3",
                                                    selectionMode === m.id ? "bg-white text-primary shadow-xl shadow-black/5" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                <m.icon className="w-4 h-4" />
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { id: 'disponible', label: 'Disponible', color: 'emerald' },
                                            { id: 'moyennement', label: 'Partiel', color: 'amber' },
                                            { id: 'indisponible', label: 'Absent', color: 'rose' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setStatut(s.id as any)}
                                                className={cn(
                                                    "flex-1 px-8 py-5 rounded-3xl border-2 font-black text-sm transition-all text-center",
                                                    statut === s.id
                                                        ? s.id === 'disponible' ? "bg-emerald-500 border-emerald-500 text-white shadow-2xl shadow-emerald-500/20"
                                                            : s.id === 'moyennement' ? "bg-amber-500 border-amber-500 text-white shadow-2xl shadow-amber-500/20"
                                                                : "bg-rose-500 border-rose-500 text-white shadow-2xl shadow-rose-500/20"
                                                        : "bg-white border-slate-50 text-slate-300 hover:border-slate-200"
                                                )}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-4">
                                    <span className="w-8 h-px bg-slate-100"></span>
                                    02. Plage Temporelle
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Calendrier</label>
                                        <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                                            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-transparent border-none text-slate-900 font-bold outline-none flex-1 py-2" />
                                            <ChevronRight className="w-5 h-5 text-slate-200" />
                                            <input type="date" value={dateFin} readOnly={selectionMode !== 'jour'} className={cn("bg-transparent border-none font-bold outline-none flex-1 py-2", selectionMode === 'jour' ? "text-slate-900" : "text-slate-200")} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Horaires</label>
                                        <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-3xl shadow-xl">
                                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-transparent border-none font-black text-xl outline-none flex-1 text-center py-2" />
                                            <span className="text-white/20 font-light">—</span>
                                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-transparent border-none font-black text-xl outline-none flex-1 text-center py-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-4">
                                    <span className="w-8 h-px bg-slate-100"></span>
                                    03. Nuitée & Dortoirs
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setLogeBg(!logeBg)}
                                    className={cn(
                                        "w-full p-10 rounded-[3rem] border-4 flex items-center justify-between transition-all group",
                                        logeBg ? "border-primary bg-primary/5 text-primary shadow-2xl shadow-primary/10" : "border-slate-50 bg-white text-slate-300 hover:border-slate-100 hover:text-slate-500"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-2">
                                        <div className="flex items-center gap-4">
                                            <Bed className={cn("w-8 h-8 transition-transform group-hover:scale-110", logeBg ? "text-primary" : "text-slate-200")} />
                                            <span className="text-2xl font-black tracking-tight">Dormir sur place aux dortoirs (BG)</span>
                                        </div>
                                        <p className="text-sm font-medium opacity-60 ml-12">Cochez cette case si vous logez dans nos dortoirs internes.</p>
                                    </div>
                                    {logeBg && (
                                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                            <Moon className="w-7 h-7 text-white" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="pt-10 flex items-center gap-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-slate-900 hover:bg-black text-white py-8 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl shadow-slate-900/40 hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    Confirmer la déclaration
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/calendrier')}
                                    className="h-24 w-24 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all group"
                                >
                                    <X className="w-8 h-8 transition-transform group-hover:rotate-90" />
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <header className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Mes <span className="text-primary italic">Plannings</span></h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{existingAvailabilities.length} Déclarations actives</p>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 gap-6 max-h-[900px] overflow-y-auto pr-4 custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                {existingAvailabilities.length > 0 ? (
                                    existingAvailabilities.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-white transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className={cn(
                                                "absolute top-0 left-0 w-2 h-full",
                                                item.statut === 'disponible' ? "bg-emerald-500" :
                                                    item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500"
                                            )} />

                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                            item.statut === 'disponible' ? "bg-emerald-50 text-emerald-600" :
                                                                item.statut === 'moyennement' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {item.statut}
                                                        </div>
                                                        {item.logeBg && (
                                                            <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                <Bed className="w-3 h-3" />
                                                                Dortoir BG
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                                                            {format(new Date(item.dateDebut), 'dd', { locale: fr })}
                                                            <span className="text-slate-300 text-lg mx-2 font-light">
                                                                {format(new Date(item.dateDebut), 'MMM', { locale: fr })}
                                                            </span>
                                                            <span className="mx-4 text-slate-100 font-thin">—</span>
                                                            {format(new Date(item.dateFin), 'dd', { locale: fr })}
                                                            <span className="text-slate-300 text-lg mx-2 font-light">
                                                                {format(new Date(item.dateFin), 'MMM', { locale: fr })}
                                                            </span>
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center gap-6 text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="text-sm font-bold uppercase tracking-tight">{item.horaireText}</span>
                                                        </div>
                                                        <div className="h-4 w-px bg-slate-100" />
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px] text-slate-900">
                                                                {user?.prenom[0]}{user?.nom[0]}
                                                            </div>
                                                            <span className="text-xs font-medium italic">Par vous</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-16 h-16 rounded-3xl bg-transparent border border-slate-50 text-slate-100 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center group/del"
                                                >
                                                    <Trash2 className="w-6 h-6 transition-transform group-hover/del:scale-110" />
                                                </button>
                                            </div>

                                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-primary/2 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                                            <Calendar className="w-10 h-10 text-slate-100" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-black text-slate-900">Aucun historique</p>
                                            <p className="text-sm text-slate-400 font-medium">Commencez par déclarer votre première disponibilité.</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </main>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-12 right-12 z-[100]"
                    >
                        <div className="bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border border-white/10">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-black tracking-tight">{success}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Mise à jour effectuée</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function MaDisponibilitePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ nom: string; prenom: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    // "periodType" renamed to handle Google Calendar like recurring events logic later if needed
    const [selectionMode, setSelectionMode] = useState<'jour' | 'semaine' | 'mois'>('jour');
    const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
    const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
    const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'moyennement'>('disponible');

    // Time selection (Google Calendar style)
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    const [logeBg, setLogeBg] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        // Auto-calculate date fin based on selection mode
        if (dateDebut) {
            const debut = new Date(dateDebut);
            let fin = new Date(dateDebut);

            if (selectionMode === 'jour') {
                fin = debut;
            } else if (selectionMode === 'semaine') {
                fin.setDate(debut.getDate() + 6);
            } else if (selectionMode === 'mois') {
                fin = new Date(debut.getFullYear(), debut.getMonth() + 1, 0);
            }

            setDateFin(fin.toISOString().split('T')[0]);
        }
    }, [dateDebut, selectionMode]);

    const fetchUser = async () => {
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
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        // Construct readable time string
        const horaireText = `${startTime} - ${endTime}`;

        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodeType: selectionMode,
                    dateDebut,
                    dateFin,
                    statut,
                    horaireText,
                    logeBg,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-3xl">✏️</span>
                            Définir ma disponibilité
                        </h1>
                        <p className="text-slate-500 mt-1 ml-11">Mettez à jour votre statut pour l&apos;équipe</p>
                    </div>

                    {/* Quick date navigator (Like GCal) */}
                    <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                        <button
                            onClick={() => setSelectionMode('jour')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectionMode === 'jour' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Jour
                        </button>
                        <button
                            onClick={() => setSelectionMode('semaine')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectionMode === 'semaine' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Semaine
                        </button>
                        <button
                            onClick={() => setSelectionMode('mois')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectionMode === 'mois' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Mois
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-8 relative overflow-hidden">
                            {/* Decorative top border */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statut === 'disponible' ? 'from-teal-400 to-teal-600' :
                                statut === 'moyennement' ? 'from-amber-400 to-amber-600' :
                                    'from-red-400 to-red-600'
                                }`} />

                            {/* Date Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">
                                    Quand ?
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Du</label>
                                        <input
                                            type="date"
                                            value={dateDebut}
                                            onChange={(e) => setDateDebut(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end pb-4 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Au (inclus)</label>
                                        <input
                                            type="date"
                                            value={dateFin}
                                            readOnly={selectionMode !== 'jour'} // Allow edit only if custom/jour, usually auto-calced
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time Selection (Google Calendar Style) */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">
                                    Horaires
                                </label>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex-1">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-transparent border-none text-2xl font-bold text-slate-700 focus:ring-0 p-0 cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-500">Début</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-300"></div>
                                    <div className="flex-1 text-right">
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-transparent border-none text-2xl font-bold text-slate-700 focus:ring-0 p-0 text-right cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-500">Fin</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full" />

                            {/* Status Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">
                                    Mon Statut
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStatut('disponible')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${statut === 'disponible'
                                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50/30'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statut === 'disponible' ? 'bg-teal-500 text-white' : 'bg-slate-100'}`}>✓</div>
                                        <span className="font-semibold text-sm">Disponible</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatut('moyennement')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${statut === 'moyennement'
                                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50/30'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statut === 'moyennement' ? 'bg-amber-400 text-white' : 'bg-slate-100'}`}>~</div>
                                        <span className="font-semibold text-sm">Mitigé</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatut('indisponible')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${statut === 'indisponible'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50/30'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statut === 'indisponible' ? 'bg-red-500 text-white' : 'bg-slate-100'}`}>✕</div>
                                        <span className="font-semibold text-sm">Indisponible</span>
                                    </button>
                                </div>
                            </div>

                            {/* Loge BG Toggle */}
                            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group cursor-pointer" onClick={() => setLogeBg(!logeBg)}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${logeBg ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-700">Je loge à BG</h3>
                                        <p className="text-xs text-slate-500">Indiquez si vous êtes présent sur le site</p>
                                    </div>
                                </div>

                                <div className={`w-12 h-7 rounded-full transition-colors relative ${logeBg ? 'bg-secondary' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow transition-transform ${logeBg ? 'translate-x-5' : ''}`} />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all active:scale-[0.98] ${saving
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-primary/30 hover:-translate-y-0.5'
                                    }`}
                            >
                                {saving ? 'Enregistrement en cours...' : 'Confirmer mes disponibilités'}
                            </button>

                            {/* Success Message */}
                            {success && (
                                <div className="absolute top-4 right-4 animate-fade-in bg-white border border-green-100 shadow-xl rounded-lg p-4 flex items-center gap-3">
                                    <div className="bg-green-100 text-green-600 rounded-full p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-green-700 text-sm">Disponibilité enregistrée !</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Aperçu Visuel</h3>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-lg ring-4 ring-white">
                                    {user?.prenom[0]}{user?.nom[0]}
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">{user?.prenom} {user?.nom}</h4>
                                <p className="text-sm text-slate-500 mb-4">Collaborateur</p>

                                <div className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 mb-2 ${statut === 'disponible' ? 'bg-teal-100 text-teal-700' :
                                    statut === 'moyennement' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    <span className="font-bold text-sm uppercase">{statut}</span>
                                </div>

                                <div className="text-xs text-slate-500 font-medium">
                                    {startTime} - {endTime}
                                </div>

                                {logeBg && (
                                    <div className="mt-3 flex items-center gap-1.5 text-secondary bg-secondary/5 px-3 py-1 rounded-full border border-secondary/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                        </svg>
                                        <span className="text-xs font-bold">Loge à BG</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Astuce</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Utilisez le mode <strong>Semaine</strong> pour déclarer rapidement votre présence pour les 7 prochains jours en un seul clic.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

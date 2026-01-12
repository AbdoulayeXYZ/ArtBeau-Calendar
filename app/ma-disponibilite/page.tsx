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
    const [periodeType, setPeriodeType] = useState<'jour' | 'semaine' | 'mois'>('jour');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'moyennement'>('disponible');
    const [horaireText, setHoraireText] = useState('');
    const [logeBg, setLogeBg] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        // Auto-calculate date fin based on periode type
        if (dateDebut) {
            const debut = new Date(dateDebut);
            let fin = new Date(dateDebut);

            if (periodeType === 'jour') {
                // Same day
                fin = debut;
            } else if (periodeType === 'semaine') {
                // +6 days
                fin.setDate(debut.getDate() + 6);
            } else if (periodeType === 'mois') {
                // End of month
                fin = new Date(debut.getFullYear(), debut.getMonth() + 1, 0);
            }

            setDateFin(fin.toISOString().split('T')[0]);
        }
    }, [dateDebut, periodeType]);

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

        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodeType,
                    dateDebut,
                    dateFin,
                    statut,
                    horaireText: horaireText || null,
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-slate-600">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar user={user!} />

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Ma Disponibilité</h1>
                    <p className="text-slate-600">Déclarez votre disponibilité pour l&apos;équipe</p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-6">
                    {/* Periode Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Type de période
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['jour', 'semaine', 'mois'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setPeriodeType(type)}
                                    className={`px-4 py-3 rounded-lg font-medium capitalize transition-all ${periodeType === type
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Debut */}
                    <div>
                        <label htmlFor="dateDebut" className="block text-sm font-semibold text-slate-700 mb-2">
                            Date de début
                        </label>
                        <input
                            id="dateDebut"
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Date Fin (auto-calculated, read-only) */}
                    <div>
                        <label htmlFor="dateFin" className="block text-sm font-semibold text-slate-700 mb-2">
                            Date de fin (calculée automatiquement)
                        </label>
                        <input
                            id="dateFin"
                            type="date"
                            value={dateFin}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-600"
                        />
                    </div>

                    {/* Statut */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Statut de disponibilité
                        </label>
                        <div className="space-y-2">
                            {(['disponible', 'moyennement', 'indisponible'] as const).map((s) => (
                                <label
                                    key={s}
                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${statut === s
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="statut"
                                        value={s}
                                        checked={statut === s}
                                        onChange={(e) => setStatut(e.target.value as 'disponible' | 'indisponible' | 'moyennement')}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <span className="ml-3 font-medium capitalize text-slate-700">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Horaire */}
                    <div>
                        <label htmlFor="horaire" className="block text-sm font-semibold text-slate-700 mb-2">
                            Horaire (optionnel)
                        </label>
                        <input
                            id="horaire"
                            type="text"
                            value={horaireText}
                            onChange={(e) => setHoraireText(e.target.value)}
                            placeholder="Ex: 9h-17h ou 15h-17h"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    {/* Loge BG */}
                    <div>
                        <label className="flex items-center p-4 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-primary transition-all">
                            <input
                                type="checkbox"
                                checked={logeBg}
                                onChange={(e) => setLogeBg(e.target.checked)}
                                className="w-5 h-5 text-primary focus:ring-primary rounded"
                            />
                            <span className="ml-3 font-medium text-slate-700">Je loge à BG</span>
                        </label>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-disponible/10 border border-disponible text-disponible px-4 py-3 rounded-lg font-medium animate-fade-in">
                            ✓ Disponibilité enregistrée avec succès !
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-4 rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer ma disponibilité'}
                    </button>
                </form>
            </div>
        </div>
    );
}

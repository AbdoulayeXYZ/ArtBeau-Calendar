'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AvailabilityCard from '@/components/AvailabilityCard';
import FilterBar from '@/components/FilterBar';

interface AvailabilityData {
    id: number;
    periodeType: 'jour' | 'semaine' | 'mois';
    dateDebut: string;
    dateFin: string;
    statut: 'disponible' | 'indisponible' | 'moyennement';
    horaireText: string | null;
    logeBg: boolean;
    user: {
        id: number;
        username: string;
        nom: string;
        prenom: string;
    };
}

export default function CalendrierPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ nom: string; prenom: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailabilityData[]>([]);

    // Filter state
    const [period, setPeriod] = useState('');
    const [logeBgFilter, setLogeBgFilter] = useState('');
    const [availableNow, setAvailableNow] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchAvailability();
        }
    }, [user, period, logeBgFilter, availableNow]);

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

    const fetchAvailability = async () => {
        try {
            const params = new URLSearchParams();
            if (period) params.append('period', period);
            if (logeBgFilter) params.append('loge_bg', logeBgFilter);
            if (availableNow) params.append('available_now', 'true');

            const response = await fetch(`/api/availability?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const data = await response.json();
            setAvailability(data.availability);
        } catch (error) {
            console.error('Fetch availability error:', error);
        }
    };

    const handleAvailableNowToggle = () => {
        setAvailableNow(!availableNow);
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Calendrier de l&apos;équipe</h1>
                    <p className="text-slate-600">
                        Vue d&apos;ensemble des disponibilités • {availability.length} entrée{availability.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <FilterBar
                            period={period}
                            logeBgFilter={logeBgFilter}
                            availableNow={availableNow}
                            onPeriodChange={setPeriod}
                            onLogeBgChange={setLogeBgFilter}
                            onAvailableNowToggle={handleAvailableNowToggle}
                        />
                    </div>

                    {/* Availability Grid */}
                    <div className="lg:col-span-3">
                        {availability.length === 0 ? (
                            <div className="glass rounded-xl p-12 text-center">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                    Aucune disponibilité trouvée
                                </h3>
                                <p className="text-slate-600">
                                    Aucune disponibilité ne correspond aux filtres sélectionnés.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 animate-fade-in">
                                {availability.map((avail) => (
                                    <AvailabilityCard
                                        key={avail.id}
                                        user={avail.user}
                                        periodeType={avail.periodeType}
                                        dateDebut={avail.dateDebut}
                                        dateFin={avail.dateFin}
                                        statut={avail.statut}
                                        horaireText={avail.horaireText}
                                        logeBg={avail.logeBg}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

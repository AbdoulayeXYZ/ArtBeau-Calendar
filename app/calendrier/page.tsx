'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';

interface AvailabilityData {
    id: number;
    user: {
        nom: string;
        prenom: string;
        username: string;
    };
    periodeType: string;
    dateDebut: string;
    dateFin: string;
    statut: 'disponible' | 'indisponible' | 'moyennement';
    horaireText: string;
    logeBg: boolean;
    updatedAt: string;
}

export default function CalendrierPage() {
    const [user, setUser] = useState<{ nom: string; prenom: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailabilityData[]>([]);

    // Filters
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [logeBgOnly, setLogeBgOnly] = useState(false);
    const [availableNowOnly, setAvailableNowOnly] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchAvailability();
    }, [period, logeBgOnly, availableNowOnly]);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Fetch user error:', error);
        }
    };

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (period) params.append('period', period);
            if (logeBgOnly) params.append('loge_bg', 'true');
            if (availableNowOnly) params.append('available_now', 'true');

            const response = await fetch(`/api/availability?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setAvailability(data.data);
            }
        } catch (error) {
            console.error('Fetch availability error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70">
            <Navbar user={user} />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Planning Équipe</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Vue temporelle des disponibilités
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex text-xs font-semibold text-slate-600">
                            <div className="px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                                Disponible
                            </div>
                            <div className="px-3 py-1.5 flex items-center gap-1.5 border-l border-slate-100">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                Mitigé
                            </div>
                            <div className="px-3 py-1.5 flex items-center gap-1.5 border-l border-slate-100">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                Absent
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8 sticky top-20 z-40 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/40 shadow-sm transition-all">
                    <FilterBar
                        period={period}
                        setPeriod={setPeriod}
                        logeBgOnly={logeBgOnly}
                        setLogeBgOnly={setLogeBgOnly}
                        availableNowOnly={availableNowOnly}
                        setAvailableNowOnly={setAvailableNowOnly}
                    />
                </div>

                {/* Calendar Grid View */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-40 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                        ))}
                    </div>
                ) : availability.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            😴
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">C&apos;est bien calme ici...</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Aucune disponibilité trouvée pour ces critères. Essayez de modifier les filtres.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {availability.map((item) => (
                            <div key={item.id} className="group hover:-translate-y-1 transition-transform duration-300">
                                {/* Card */}
                                <div className="bg-white rounded-xl shadow-card hover:shadow-float overflow-hidden border border-slate-100 relative h-full flex flex-col">

                                    {/* Status Bar Top */}
                                    <div className={`h-1.5 w-full ${item.statut === 'disponible' ? 'bg-teal-500' :
                                        item.statut === 'moyennement' ? 'bg-amber-400' :
                                            'bg-red-500'
                                        }`} />

                                    <div className="p-5 flex flex-col flex-grow">
                                        {/* Header: User Info */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm ring-2 ring-white shadow-sm">
                                                    {item.user.prenom[0]}{item.user.nom[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight">
                                                        {item.user.prenom} {item.user.nom}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
                                                        {item.statut}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Availability Status Icon */}
                                            <div className={`p-1.5 rounded-full ${item.statut === 'disponible' ? 'bg-teal-50 text-teal-600' :
                                                item.statut === 'moyennement' ? 'bg-amber-50 text-amber-500' :
                                                    'bg-red-50 text-red-500'
                                                }`}>
                                                {item.statut === 'disponible' ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : item.statut === 'moyennement' ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Time Slot - VERY VISIBLE */}
                                        <div className="bg-slate-50 rounded-lg p-3 text-center mb-4 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                                            <span className="text-lg font-bold text-slate-800 tracking-tight font-mono">
                                                {item.horaireText || 'Toute la journée'}
                                            </span>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 mt-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                            </svg>
                                            <span>
                                                {new Date(item.dateDebut).toLocaleDateString()} - {new Date(item.dateFin).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Badges Footer */}
                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {item.logeBg && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary text-white shadow-sm">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                        LOGE À BG
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 italic">
                                                MàJ {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

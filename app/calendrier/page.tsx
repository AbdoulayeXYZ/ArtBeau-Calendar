'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    MapPin,
    Calendar as CalendarIcon,
    ArrowRight,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityData {
    id: number;
    user: {
        id: number;
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

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00

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
            const params = new URLSearchParams();
            if (period) params.append('period', period);
            if (logeBgOnly) params.append('loge_bg', 'true');
            if (availableNowOnly) params.append('available_now', 'true');

            const response = await fetch(`/api/availability?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setAvailability(data.availability);
            }
        } catch (error) {
            console.error('Fetch availability error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Process data for the grid
    const teamMembers = useMemo(() => {
        const membersMap = new Map();
        availability.forEach(a => {
            if (!membersMap.has(a.user.username)) {
                membersMap.set(a.user.username, a.user);
            }
        });
        return Array.from(membersMap.values());
    }, [availability]);

    // Helper to calculate position in grid
    const getTimePosition = (timeStr: string) => {
        if (!timeStr) return 0;
        try {
            const [h, m] = timeStr.split(':').map(Number);
            const decimalHour = h + m / 60;
            const position = (decimalHour - 8) * 80; // 80px per hour
            return Math.max(0, position);
        } catch {
            return 0;
        }
    };

    const getTimeHeight = (horaireText: string) => {
        if (!horaireText || !horaireText.includes('-')) return 80; // default 1h
        try {
            const [start, end] = horaireText.split('-').map(s => s.trim());
            const startPos = getTimePosition(start);
            const endPos = getTimePosition(end);
            return Math.max(40, endPos - startPos);
        } catch {
            return 80;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar user={user} />

            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
                {/* Superior Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                Planning Equipe
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                v3.0 High-Fidelity
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                            Art&apos;Beau <span className="text-primary italic">Live</span>
                        </h1>
                        <p className="text-slate-500 font-medium whitespace-nowrap">Vue temps réel des forces en présence.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-6 bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <div className="flex -space-x-3 overflow-hidden">
                            {teamMembers.slice(0, 5).map((m) => (
                                <div key={m.username} className="inline-block h-10 w-10 rounded-xl ring-4 ring-white bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200">
                                    {m.prenom[0]}{m.nom[0]}
                                </div>
                            ))}
                            {teamMembers.length > 5 && (
                                <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-4 ring-white bg-slate-900 text-white text-[10px] font-black">
                                    +{teamMembers.length - 5}
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Equipe</span>
                            <span className="text-xl font-black text-slate-900">{teamMembers.length} Personnes</span>
                        </div>
                    </motion.div>
                </div>

                {/* Pro Filters */}
                <div className="mb-12 sticky top-24 z-40">
                    <FilterBar
                        period={period}
                        setPeriod={setPeriod}
                        logeBgOnly={logeBgOnly}
                        setLogeBgOnly={setLogeBgOnly}
                        availableNowOnly={availableNowOnly}
                        setAvailableNowOnly={setAvailableNowOnly}
                    />
                </div>

                {/* GOOGLE CALENDAR GRID */}
                <div className="relative bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                    {/* Grid Header (Members) */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        <div className="w-20 sm:w-28 flex-shrink-0 border-r border-slate-100 p-4 flex flex-col items-center justify-center">
                            <Clock className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="flex flex-1 overflow-x-auto no-scrollbar">
                            {teamMembers.length > 0 ? teamMembers.map((member) => (
                                <div key={member.username} className="min-w-[200px] flex-1 border-r border-slate-100/50 p-6 flex flex-col items-center gap-3">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-black text-slate-600 shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
                                        {member.prenom[0]}{member.nom[0]}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1">{member.prenom}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.nom}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex-1 p-8 text-center text-slate-400 font-bold italic py-12">
                                    Aucun membre à afficher selon les filtres.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div className="flex h-[800px] overflow-y-auto custom-scrollbar relative">

                        {/* Time Indicators (Y-Axis) */}
                        <div className="w-20 sm:w-28 flex-shrink-0 border-r border-slate-100 bg-slate-50/30 sticky left-0 z-20 backdrop-blur-sm">
                            {HOURS.map((hour) => (
                                <div key={hour} className="h-20 flex items-start justify-center pt-2">
                                    <span className="text-[11px] font-black text-slate-400 tracking-tighter">
                                        {hour.toString().padStart(2, '0')}:00
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Lines and Slots */}
                        <div className="flex flex-1 relative min-w-full">

                            {/* Background Grid Lines */}
                            {HOURS.map((hour, i) => (
                                <div
                                    key={`line-${hour}`}
                                    style={{ top: `${i * 80}px` }}
                                    className="absolute left-0 right-0 h-px bg-slate-100 pointer-events-none"
                                />
                            ))}

                            {/* Columns per member */}
                            {teamMembers.map((member) => (
                                <div key={`col-${member.username}`} className="min-w-[200px] flex-1 border-r border-slate-100/30 relative group">

                                    {/* Visual Highlight on Hover */}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.01] transition-colors pointer-events-none" />

                                    {/* Cards in this column */}
                                    <AnimatePresence>
                                        {availability
                                            .filter(a => a.user.username === member.username)
                                            .map((item) => {
                                                const [start] = item.horaireText.split('-').map(s => s.trim());
                                                const top = getTimePosition(start);
                                                const height = getTimeHeight(item.horaireText);

                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        style={{
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            zIndex: 10
                                                        }}
                                                        className={cn(
                                                            "absolute left-2 right-2 rounded-2xl p-4 shadow-lg shadow-black/5 flex flex-col justify-between overflow-hidden border-2 group/card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all",
                                                            item.statut === 'disponible' ? "border-teal-500/20 bg-teal-50/90 text-teal-900" :
                                                                item.statut === 'moyennement' ? "border-orange-500/20 bg-orange-50/90 text-orange-900" :
                                                                    "border-red-500/20 bg-red-50/90 text-red-900"
                                                        )}
                                                    >
                                                        {/* Status Accent Left */}
                                                        <div className={cn(
                                                            "absolute top-0 left-0 bottom-0 w-1.5",
                                                            item.statut === 'disponible' ? "bg-teal-500" :
                                                                item.statut === 'moyennement' ? "bg-orange-500" :
                                                                    "bg-red-500"
                                                        )} />

                                                        <div className="relative">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Session {item.statut}</span>
                                                                {item.logeBg && <MapPin className="w-3.5 h-3.5 text-secondary animate-bounce" />}
                                                            </div>
                                                            <p className="text-xs font-black leading-tight line-clamp-2">
                                                                {item.horaireText || 'Journée'}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-end justify-between mt-auto">
                                                            <div className="flex gap-1.5">
                                                                {item.logeBg && (
                                                                    <div className="bg-secondary text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase">BG</div>
                                                                )}
                                                            </div>
                                                            <div className="h-6 w-6 rounded-lg bg-black/5 flex items-center justify-center group-hover/card:bg-black/10 transition-colors">
                                                                <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        }
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Footer / Legend */}
                    <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-wrap items-center justify-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-teal-500" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Disponible</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-orange-500" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Moyennement</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-red-500" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Indisponible</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-secondary" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Site (BG)</span>
                        </div>
                    </div>
                </div>

                {/* Floating Action Hint */}
                {availability.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-200 shadow-xl">
                            <Info className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold text-slate-500">
                                Cliquez sur une carte pour voir les détails
                            </p>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

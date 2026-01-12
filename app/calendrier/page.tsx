'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    MapPin,
    ArrowRight,
    Info,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    BedDouble
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    isToday,
    addMonths,
    subMonths,
    eachDayOfInterval,
    isSameDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

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

    // Navigation & View State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

    // Filters
    const [logeBgOnly, setLogeBgOnly] = useState(false);
    const [availableNowOnly, setAvailableNowOnly] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchAvailability();
    }, [period, logeBgOnly, availableNowOnly, currentDate]);

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
            params.append('period', period);
            if (logeBgOnly) params.append('loge_bg', 'true');
            if (availableNowOnly) params.append('available_now', 'true');

            // If we're not on 'today', we might need to send a date reference
            // The current API might need adjustment to handle specific date ranges, 
            // but for now we rely on the existing params.

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

    const teamMembers = useMemo(() => {
        const membersMap = new Map();
        availability.forEach(a => {
            if (!membersMap.has(a.user.username)) {
                membersMap.set(a.user.username, a.user);
            }
        });
        return Array.from(membersMap.values());
    }, [availability]);

    // View Navigation Helpers
    const next = () => {
        if (period === 'today') setCurrentDate(d => addDays(d, 1));
        if (period === 'week') setCurrentDate(d => addWeeks(d, 1));
        if (period === 'month') setCurrentDate(d => addMonths(d, 1));
    };
    const prev = () => {
        if (period === 'today') setCurrentDate(d => addDays(d, -1));
        if (period === 'week') setCurrentDate(d => subWeeks(d, 1));
        if (period === 'month') setCurrentDate(d => subMonths(d, 1));
    };

    const dayLabel = useMemo(() => {
        if (period === 'today') return format(currentDate, "EEEE d MMMM", { locale: fr });
        if (period === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: fr })}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }, [currentDate, period]);

    // Grid Calc Helpers
    const getTimePosition = (timeStr: string) => {
        if (!timeStr) return 0;
        try {
            const [h, m] = timeStr.split(':').map(Number);
            const decimalHour = h + m / 60;
            return Math.max(0, (decimalHour - 8) * 80);
        } catch { return 0; }
    };

    const getTimeHeight = (horaireText: string) => {
        if (!horaireText || !horaireText.includes('-')) return 80;
        try {
            const [start, end] = horaireText.split('-').map(s => s.trim());
            const startPos = getTimePosition(start);
            const endPos = getTimePosition(end);
            return Math.max(40, endPos - startPos);
        } catch { return 80; }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 selection:bg-primary/10">
            <Navbar user={user} />

            <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

                {/* Superior Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 gap-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                                Live Dashboard
                            </div>
                            {period !== 'today' && (
                                <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    Vue {period}
                                </div>
                            )}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                            Art&apos;Beau <span className="text-primary italic">Calendar</span>
                        </h1>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 w-fit">
                            <button onClick={prev} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                            <span className="text-sm font-black text-slate-700 min-w-[180px] text-center capitalize">{dayLabel}</span>
                            <button onClick={next} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-8 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex -space-x-3">
                            {teamMembers.slice(0, 5).map((m) => (
                                <div key={m.username} className="h-12 w-12 rounded-2xl ring-4 ring-white bg-slate-100 flex items-center justify-center font-black text-sm text-slate-600 border border-slate-200 uppercase">
                                    {m.prenom[0]}{m.nom[0]}
                                </div>
                            ))}
                            {teamMembers.length > 5 && (
                                <div className="h-12 w-12 rounded-2xl ring-4 ring-white bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                                    +{teamMembers.length - 5}
                                </div>
                            )}
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Equipe Active</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{teamMembers.length} Collaborateurs</span>
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

                {/* DYNAMIC CALENDAR CONTENT */}
                <AnimatePresence mode='wait'>
                    {period === 'today' ? (
                        /* TODAY: Detailed Time Grid (Master View) */
                        <motion.div
                            key="view-today"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative bg-white rounded-[2rem] lg:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-30 backdrop-blur-md">
                                <div className="w-20 sm:w-32 flex-shrink-0 border-r border-slate-100 p-4 lg:p-6 flex flex-col items-center justify-center bg-slate-50/50">
                                    <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
                                </div>
                                <div className="flex flex-1 overflow-x-auto no-scrollbar scroll-smooth">
                                    {teamMembers.map((member) => (
                                        <div key={member.username} className="min-w-[160px] lg:min-w-[220px] flex-1 border-r border-slate-100/50 p-4 lg:p-8 flex flex-col items-center gap-2 lg:gap-4 hover:bg-white transition-colors">
                                            <div className="h-10 w-10 lg:h-16 lg:w-16 rounded-xl lg:rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center text-sm lg:text-xl font-black text-slate-700 shadow-sm border border-slate-200 uppercase">
                                                {member.prenom[0]}{member.nom[0]}
                                            </div>
                                            <div className="text-center space-y-0.5 lg:space-y-1">
                                                <h3 className="font-black text-slate-900 tracking-tight leading-none text-xs lg:text-lg">{member.prenom}</h3>
                                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{member.nom}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex h-[600px] lg:h-[800px] overflow-y-auto custom-scrollbar relative bg-white/50">
                                <div className="w-20 sm:w-32 flex-shrink-0 border-r border-slate-100 bg-slate-50/30 sticky left-0 z-20 backdrop-blur-md">
                                    {HOURS.map((hour) => (
                                        <div key={hour} className="h-20 flex items-start justify-center pt-3 border-b border-slate-50 bg-slate-50/80">
                                            <span className="text-[10px] lg:text-[11px] font-black text-slate-400 tabular-nums">
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-1 relative min-w-max lg:min-w-full">
                                    {HOURS.map((hour, i) => (
                                        <div key={`line-${hour}`} style={{ top: `${i * 80}px` }} className="absolute left-0 right-0 h-px bg-slate-100/60 pointer-events-none" />
                                    ))}

                                    {teamMembers.map((member) => (
                                        <div key={`col-${member.username}`} className="min-w-[160px] lg:min-w-[220px] flex-1 border-r border-slate-100/50 relative group">
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
                                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                                style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}
                                                                className={cn(
                                                                    "absolute left-1.5 right-1.5 lg:left-3 lg:right-3 rounded-2xl lg:rounded-3xl p-3 lg:p-5 shadow-2xl shadow-black/5 flex flex-col justify-between overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                                                                    item.statut === 'disponible' ? "bg-emerald-50 border-emerald-500/10 text-emerald-900" :
                                                                        item.statut === 'moyennement' ? "bg-amber-50 border-amber-500/10 text-amber-900" :
                                                                            "bg-rose-50 border-rose-500/10 text-rose-900"
                                                                )}
                                                            >
                                                                <div className={cn("absolute top-0 left-0 bottom-0 w-2",
                                                                    item.statut === 'disponible' ? "bg-emerald-500" :
                                                                        item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500")} />

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.statut}</span>
                                                                        {item.logeBg && <BedDouble className="w-4 h-4 text-primary animate-pulse" />}
                                                                    </div>
                                                                    <p className="text-sm font-black tracking-tight">{item.horaireText}</p>
                                                                </div>
                                                                {item.logeBg && (
                                                                    <div className="mt-auto flex">
                                                                        <span className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Dortoir</span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })
                                                }
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : period === 'week' ? (
                        /* WEEK: Collaborative Matrix View */
                        <motion.div
                            key="view-week"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-[2rem] lg:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-30 backdrop-blur-md">
                                <div className="w-32 lg:w-48 flex-shrink-0 border-r border-slate-100 p-4 lg:p-6 flex flex-col items-center justify-center bg-slate-50/50 font-black text-[10px] text-slate-300 uppercase tracking-widest">
                                    Collaborateur
                                </div>
                                <div className="flex flex-1">
                                    {eachDayOfInterval({
                                        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                                        end: endOfWeek(currentDate, { weekStartsOn: 1 })
                                    }).map((day: Date, i: number) => (
                                        <div key={i} className={cn(
                                            "flex-1 border-r border-slate-100/50 p-4 lg:p-6 flex flex-col items-center gap-1 min-w-[100px]",
                                            isToday(day) ? "bg-primary/5" : ""
                                        )}>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{format(day, 'EEE', { locale: fr })}</span>
                                            <span className={cn("text-lg font-black tracking-tight", isToday(day) ? "text-primary" : "text-slate-900")}>{format(day, 'dd')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {teamMembers.map((member) => (
                                    <div key={member.username} className="flex min-h-[120px] group hover:bg-slate-50/50 transition-colors">
                                        <div className="w-32 lg:w-48 flex-shrink-0 border-r border-slate-100 p-6 flex flex-col items-center justify-center gap-3">
                                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center text-xs lg:text-sm font-black text-slate-700 shadow-sm border border-slate-200 uppercase">
                                                {member.prenom[0]}{member.nom[0]}
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-black text-slate-900 text-[11px] lg:text-sm leading-none">{member.prenom}</h4>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.nom}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-1">
                                            {eachDayOfInterval({
                                                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                                                end: endOfWeek(currentDate, { weekStartsOn: 1 })
                                            }).map((day: Date, i: number) => {
                                                const dailyAvail = availability.filter(a =>
                                                    a.user.username === member.username &&
                                                    isSameDay(new Date(a.dateDebut), day)
                                                );

                                                return (
                                                    <div key={i} className={cn(
                                                        "flex-1 border-r border-slate-100/30 p-2 lg:p-4 min-w-[100px] relative",
                                                        isToday(day) ? "bg-primary/5" : ""
                                                    )}>
                                                        <div className="space-y-2">
                                                            {dailyAvail.map(a => (
                                                                <div key={a.id} className={cn(
                                                                    "p-2 lg:p-3 rounded-xl lg:rounded-2xl border flex flex-col gap-1 shadow-sm",
                                                                    a.statut === 'disponible' ? "bg-emerald-50 border-emerald-500/10 text-emerald-900" :
                                                                        a.statut === 'moyennement' ? "bg-amber-50 border-amber-500/10 text-amber-900" :
                                                                            "bg-rose-50 border-rose-500/10 text-rose-900"
                                                                )}>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{a.horaireText}</span>
                                                                        {a.logeBg && <BedDouble className="w-3 h-3 text-primary" />}
                                                                    </div>
                                                                    <span className="text-[10px] font-black capitalize">{a.statut}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* MONTH: Global Calendar View */
                        <motion.div
                            key="view-month"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
                        >
                            <div className="grid grid-cols-7 gap-6">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                                    <div key={d} className="text-center text-xs font-black text-slate-300 uppercase tracking-widest pb-6">{d}</div>
                                ))}
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const dailyAvail = availability.filter(a => {
                                        const start = new Date(a.dateDebut);
                                        const end = new Date(a.dateFin);
                                        const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                                        return current >= start && current <= end;
                                    });

                                    return (
                                        <div key={i} className={cn(
                                            "aspect-square rounded-[2rem] p-4 flex flex-col gap-2 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100",
                                            isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum)) ? "bg-primary/5 border-primary/10" : "bg-white"
                                        )}>
                                            <span className={cn(
                                                "text-xl font-black tabular-nums",
                                                isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum)) ? "text-primary" : "text-slate-900"
                                            )}>{dayNum}</span>

                                            <div className="mt-auto space-y-1">
                                                {dailyAvail.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {dailyAvail.slice(0, 3).map(a => (
                                                            <div key={a.id} className={cn(
                                                                "w-full h-1.5 rounded-full",
                                                                a.statut === 'disponible' ? "bg-emerald-500" :
                                                                    a.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500"
                                                            )} />
                                                        ))}
                                                        {dailyAvail.length > 3 && (
                                                            <span className="text-[8px] font-black text-slate-300">{dailyAvail.length}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend */}
                <div className="mt-16 bg-white/50 backdrop-blur-sm border border-white p-8 rounded-[3rem] flex flex-wrap items-center justify-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Disponible</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500 shadow-xl shadow-amber-500/20" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Partiel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-rose-500 shadow-xl shadow-rose-500/20" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Absent</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <BedDouble className="w-5 h-5 text-primary" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Logement BG</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

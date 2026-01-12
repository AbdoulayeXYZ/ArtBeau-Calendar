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
    eachDayOfInterval,
    isSameDay
} from 'date-fns';
import { fr } from 'date-fns/locale';
// import { useEventNotifications } from '@/hooks/useEventNotifications'; // Disabled
import { useSwipeable } from 'react-swipeable';
import { useViewport } from '@/hooks/useViewport';
import MemberCard from '@/components/mobile/MemberCard';

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
const PX_PER_HOUR = 50; // Compact height

export default function CalendrierPage() {
    // ... state ...
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

            const response = await fetch(`/api/availability?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                let results = data.availability;

                // Apply client-side time filtering for "available now"
                if (availableNowOnly) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const currentTimeDecimal = currentHour + currentMinute / 60;

                    results = results.filter((a: AvailabilityData) => {
                        if (!a.horaireText || !a.horaireText.includes('-')) return false;

                        try {
                            const [start, end] = a.horaireText.split('-').map(s => s.trim());
                            const [startH, startM] = start.split(':').map(Number);
                            const [endH, endM] = end.split(':').map(Number);
                            const startTimeDecimal = startH + (startM || 0) / 60;
                            const endTimeDecimal = endH + (endM || 0) / 60;

                            return currentTimeDecimal >= startTimeDecimal && currentTimeDecimal <= endTimeDecimal;
                        } catch {
                            return false;
                        }
                    });
                }

                setAvailability(results);
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

    // Get current user's availability for notifications
    // const myAvailability = useMemo(() => {
    //     return availability.filter(a => a.user.username === user?.username);
    // }, [availability, user]);

    // Enable event notifications (DISABLED)
    // useEventNotifications(myAvailability);

    // Viewport detection for responsive behavior
    const { isMobile } = useViewport();

    // Swipe handlers for mobile navigation
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (isMobile && period === 'today') {
                next();
            }
        },
        onSwipedRight: () => {
            if (isMobile && period === 'today') {
                prev();
            }
        },
        trackMouse: false,
        preventScrollOnSwipe: false,
    });

    // View Navigation Helpers
    const next = () => {
        if (period === 'today') setCurrentDate(d => addDays(d, 1));
        if (period === 'week') setCurrentDate(d => addWeeks(d, 1));
    };
    const prev = () => {
        if (period === 'today') setCurrentDate(d => addDays(d, -1));
        if (period === 'week') setCurrentDate(d => subWeeks(d, 1));
    };

    const dayLabel = useMemo(() => {
        if (period === 'today') return format(currentDate, "EEEE d MMMM", { locale: fr });
        if (period === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: fr })}`;
        }
        return '';
    }, [currentDate, period]);

    // Grid Calc Helpers
    const getTimePosition = (timeStr: string) => {
        if (!timeStr) return 0;
        try {
            const [h, m] = timeStr.split(':').map(Number);
            const decimalHour = h + m / 60;
            return Math.max(0, (decimalHour - 8) * PX_PER_HOUR);
        } catch { return 0; }
    };

    const getTimeHeight = (horaireText: string) => {
        if (!horaireText || !horaireText.includes('-')) return PX_PER_HOUR;
        try {
            const [start, end] = horaireText.split('-').map(s => s.trim());
            const startPos = getTimePosition(start);
            const endPos = getTimePosition(end);
            return Math.max(20, endPos - startPos);
        } catch { return PX_PER_HOUR; }
    };

    // Calculate current time position for red line indicator
    const getCurrentTimePosition = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const decimalHour = hours + minutes / 60;
        return Math.max(0, (decimalHour - 8) * PX_PER_HOUR);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-950 transition-colors duration-500 selection:bg-primary/10 text-xs">
            <Navbar user={user} />

            <main className="flex-1 flex flex-col min-h-0 w-full max-w-[1700px] mx-auto px-2 lg:px-4 py-2">
                {/* Superior Header - COMPACT */}
                <div className="flex-none flex items-center justify-between mb-2 gap-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">
                            Art&apos;Beau <span className="text-primary">Cal.</span>
                        </h3>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <button onClick={prev} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 min-w-[120px] text-center capitalize">{dayLabel}</span>
                            <button onClick={next} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 px-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex -space-x-2">
                            {teamMembers.slice(0, 5).map((m) => (
                                <div key={m.username} className="h-8 w-8 rounded-lg ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                                    {m.prenom[0]}{m.nom[0]}
                                </div>
                            ))}
                            {teamMembers.length > 5 && (
                                <div className="h-8 w-8 rounded-lg ring-2 ring-white dark:ring-slate-900 bg-slate-900 dark:bg-primary text-white text-[10px] font-black flex items-center justify-center">
                                    +{teamMembers.length - 5}
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Active</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{teamMembers.length}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Pro Filters - COMPACT */}
                <div className="flex-none mb-2 z-40 transform scale-90 origin-top-left">
                    <FilterBar
                        period={period}
                        setPeriod={setPeriod}
                        logeBgOnly={logeBgOnly}
                        setLogeBgOnly={setLogeBgOnly}
                        availableNowOnly={availableNowOnly}
                        setAvailableNowOnly={setAvailableNowOnly}
                    />
                </div>

                {/* MOBILE VIEW: List of Cards */}
                {isMobile ? (
                    <div {...swipeHandlers} className="flex-1 overflow-y-auto pb-20 px-2">
                        <div className="space-y-3">
                            {teamMembers.map((member) => {
                                const memberAvailability = availability.filter(
                                    (a) => a.user.username === member.username && isSameDay(new Date(a.dateDebut), currentDate)
                                );
                                return (
                                    <MemberCard
                                        key={member.username}
                                        member={member}
                                        availability={memberAvailability}
                                    />
                                );
                            })}
                            {teamMembers.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-sm">Aucun membre d&apos;équipe</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* DESKTOP VIEW: Grid (existing) */
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <AnimatePresence mode='wait'>
                            {period === 'today' ? (
                                /* TODAY: Detailed Time Grid (Master View) */
                                <motion.div
                                    key="view-today"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden"
                                >
                                    <div className="flex-none flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-30 backdrop-blur-md">
                                        <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
                                            <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <div className="flex flex-1 overflow-x-auto no-scrollbar scroll-smooth">
                                            {teamMembers.map((member) => (
                                                <div key={member.username} className="min-w-[120px] flex-1 border-r border-slate-100/50 dark:border-slate-800/50 p-2 flex flex-col items-center gap-1 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                        {member.prenom[0]}{member.nom[0]}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">{member.prenom}</h3>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white/50 dark:bg-slate-900/50 flex">
                                        <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 sticky left-0 z-20 backdrop-blur-md">
                                            {HOURS.map((hour) => (
                                                <div key={hour} style={{ height: `${PX_PER_HOUR}px` }} className="flex items-start justify-center pt-1 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-900/80">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tabular-nums">
                                                        {hour.toString().padStart(2, '0')}:00
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-1 relative min-w-max">
                                            {HOURS.map((hour, i) => (
                                                <div key={`line-${hour}`} style={{ top: `${i * PX_PER_HOUR}px` }} className="absolute left-0 right-0 h-px bg-slate-100/60 dark:bg-white/5 pointer-events-none" />
                                            ))}

                                            {isToday(currentDate) && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    style={{ top: `${getCurrentTimePosition()}px` }}
                                                    className="absolute left-0 right-0 h-px bg-rose-500/80 dark:bg-rose-400/80 pointer-events-none z-30"
                                                >
                                                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full animate-pulse" />
                                                </motion.div>
                                            )}

                                            {teamMembers.map((member) => (
                                                <div key={`col-${member.username}`} className="min-w-[120px] flex-1 border-r border-slate-100/50 dark:border-slate-800/50 relative group">
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
                                                                            "absolute left-1 right-1 rounded-md p-1.5 shadow-sm flex flex-col justify-between overflow-hidden border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                                                                            item.statut === 'disponible' ? "bg-emerald-50 border-emerald-500/10 text-emerald-900" :
                                                                                item.statut === 'moyennement' ? "bg-amber-50 border-amber-500/10 text-amber-900" :
                                                                                    "bg-rose-50 border-rose-500/10 text-rose-900"
                                                                        )}
                                                                    >
                                                                        <div className={cn("absolute top-0 left-0 bottom-0 w-1",
                                                                            item.statut === 'disponible' ? "bg-emerald-500" :
                                                                                item.statut === 'moyennement' ? "bg-amber-500" : "bg-rose-500")} />

                                                                        <div className="pl-1.5 space-y-0.5">
                                                                            <span className="text-[10px] font-bold tracking-tight leading-none block">{item.horaireText}</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">{item.statut.slice(0, 4)}.</span>
                                                                                {item.logeBg && <BedDouble className="w-3 h-3 text-primary" />}
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
                                </motion.div>
                            ) : period === 'week' ? (
                                /* WEEK: Collaborative Matrix View - COMPACT */
                                <motion.div
                                    key="view-week"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden"
                                >
                                    <div className="flex-none flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-30 backdrop-blur-md">
                                        <div className="w-24 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 font-black text-[9px] text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                                            Collab.
                                        </div>
                                        <div className="flex flex-1">
                                            {eachDayOfInterval({
                                                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                                                end: endOfWeek(currentDate, { weekStartsOn: 1 })
                                            }).map((day: Date, i: number) => (
                                                <div key={i} className={cn(
                                                    "flex-1 border-r border-slate-100/50 dark:border-slate-800/50 p-2 flex flex-col items-center gap-0.5 min-w-[60px]",
                                                    isToday(day) ? "bg-primary/5 dark:bg-primary/10" : ""
                                                )}>
                                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{format(day, 'EEE', { locale: fr }).slice(0, 3)}</span>
                                                    <span className={cn("text-sm font-black tracking-tight", isToday(day) ? "text-primary" : "text-slate-900 dark:text-white")}>{format(day, 'dd')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                                        {teamMembers.map((member) => (
                                            <div key={member.username} className="flex min-h-[60px] group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="w-24 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 flex flex-col items-center justify-center gap-1">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                        {member.prenom[0]}{member.nom[0]}
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-[10px] leading-none">{member.prenom}</h4>
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
                                                                "flex-1 border-r border-slate-100/30 dark:border-slate-800/30 p-1 relative min-w-[60px]",
                                                                isToday(day) ? "bg-primary/5 dark:bg-primary/10" : ""
                                                            )}>
                                                                <div className="space-y-1">
                                                                    {/* User Availability */}
                                                                    {dailyAvail.map(a => (
                                                                        <div key={a.id} className={cn(
                                                                            "p-1 rounded-md border flex flex-col gap-0 shadow-sm",
                                                                            a.statut === 'disponible' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/10 text-emerald-900 dark:text-emerald-400" :
                                                                                a.statut === 'moyennement' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500/10 text-amber-900 dark:text-amber-400" :
                                                                                    "bg-rose-50 dark:bg-rose-500/10 border-rose-500/10 text-rose-900 dark:text-rose-400"
                                                                        )}>
                                                                            <span className="text-[9px] font-bold">{a.horaireText}</span>
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
                            ) : null}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

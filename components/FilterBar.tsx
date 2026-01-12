import { Dispatch, SetStateAction } from 'react';
import {
    CalendarDays,
    CalendarRange,
    CalendarCheck,
    Home,
    Clock,
    Filter,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FilterBarProps {
    period: 'today' | 'week' | 'month';
    setPeriod: Dispatch<SetStateAction<'today' | 'week' | 'month'>>;
    logeBgOnly: boolean;
    setLogeBgOnly: Dispatch<SetStateAction<boolean>>;
    availableNowOnly: boolean;
    setAvailableNowOnly: Dispatch<SetStateAction<boolean>>;
}

export default function FilterBar({
    period,
    setPeriod,
    logeBgOnly,
    setLogeBgOnly,
    availableNowOnly,
    setAvailableNowOnly
}: FilterBarProps) {

    const periods = [
        { id: 'today', label: "Aujourd'hui", icon: CalendarCheck },
        { id: 'week', label: "Semaine", icon: CalendarRange },
        { id: 'month', label: "Mois", icon: CalendarDays },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between w-full bg-white/50 backdrop-blur-sm p-3 md:p-4 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/20">
            {/* Période Selector */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
                    {periods.map((p) => {
                        const active = period === p.id;
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id as any)}
                                className={cn(
                                    "relative flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden",
                                    active ? "text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-period"
                                        className="absolute inset-0 bg-white"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn("w-4 h-4 relative z-10", active ? "text-primary" : "text-slate-400")} />
                                <span className="relative z-10 whitespace-nowrap">{p.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="hidden lg:block h-10 w-px bg-slate-200/60" />

            {/* Toggles Container */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex-1 lg:flex-none flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                    {/* Loge BG Toggle */}
                    <button
                        onClick={() => setLogeBgOnly(!logeBgOnly)}
                        className={cn(
                            "flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                            logeBgOnly
                                ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                                : "bg-transparent text-slate-500 border-transparent hover:bg-white/50"
                        )}
                    >
                        <Home className={cn("w-4 h-4", logeBgOnly ? "text-white" : "text-slate-400")} />
                        <span className="whitespace-nowrap">Loge à BG</span>
                        {logeBgOnly && <Check className="w-4 h-4" />}
                    </button>

                    {/* Available Now Toggle */}
                    <button
                        onClick={() => setAvailableNowOnly(!availableNowOnly)}
                        className={cn(
                            "flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                            availableNowOnly
                                ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                                : "bg-transparent text-slate-500 border-transparent hover:bg-white/50"
                        )}
                    >
                        <Clock className={cn("w-4 h-4", availableNowOnly ? "text-white" : "text-slate-400")} />
                        <span className="whitespace-nowrap">Dispo NOW</span>
                        <div className={cn("w-2 h-2 rounded-full", availableNowOnly ? "bg-white animate-pulse" : "bg-teal-500")}></div>
                    </button>
                </div>

                <button className="hidden sm:flex p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-95">
                    <Filter className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

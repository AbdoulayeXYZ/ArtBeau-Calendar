'use client';

import { motion } from 'framer-motion';
import {
    CalendarRange,
    CalendarCheck,
    Building2,
    Clock,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
    period: 'today' | 'week' | 'month';
    setPeriod: (period: 'today' | 'week' | 'month') => void;
    logeBgOnly: boolean;
    setLogeBgOnly: (val: boolean) => void;
    availableNowOnly: boolean;
    setAvailableNowOnly: (val: boolean) => void;
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
        { id: 'today', label: 'Jour', icon: CalendarCheck },
        { id: 'week', label: 'Semaine', icon: CalendarRange },
    ];

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* View Switcher (Segmented Control) */}
            <div className="bg-white dark:bg-slate-900 p-1.5 lg:p-2 rounded-2xl lg:rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex items-center gap-1 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
                {periods.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPeriod(p.id as any)}
                        className={cn(
                            "relative flex-1 md:flex-none flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-[1.6rem] text-sm font-black transition-all duration-500 min-w-max",
                            period === p.id
                                ? "text-white"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                    >
                        {period === p.id && (
                            <motion.div
                                layoutId="active-period"
                                className="absolute inset-0 bg-slate-900 dark:bg-slate-800 rounded-xl lg:rounded-[1.6rem] shadow-lg shadow-slate-900/20 dark:shadow-black/40"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <p.icon className={cn("w-3 h-3 lg:w-4 lg:h-4 relative z-10", period === p.id ? "text-primary" : "text-slate-300 dark:text-slate-600")} />
                        <span className="relative z-10 uppercase tracking-widest text-[8px] lg:text-[10px]">{p.label}</span>
                    </button>
                ))}
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center gap-2 lg:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth pb-1 md:pb-0">
                <button
                    onClick={() => setAvailableNowOnly(!availableNowOnly)}
                    className={cn(
                        "flex-1 md:flex-none flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-8 py-3.5 lg:py-5 rounded-xl lg:rounded-[2rem] border-2 transition-all font-black text-[8px] lg:text-[10px] uppercase tracking-widest min-w-max",
                        availableNowOnly
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                >
                    <Clock className={cn("w-3 h-3 lg:w-4 lg:h-4", availableNowOnly ? "text-white" : "text-slate-300 dark:text-slate-600")} />
                    Maintenant
                </button>

                <button
                    onClick={() => setLogeBgOnly(!logeBgOnly)}
                    className={cn(
                        "flex-1 md:flex-none flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-8 py-3.5 lg:py-5 rounded-xl lg:rounded-[2rem] border-2 transition-all font-black text-[8px] lg:text-[10px] uppercase tracking-widest min-w-max",
                        logeBgOnly
                            ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                >
                    <Building2 className={cn("w-3 h-3 lg:w-4 lg:h-4", logeBgOnly ? "text-white" : "text-slate-300 dark:text-slate-600")} />
                    Dortoir
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden xl:block mx-1" />

                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-2 w-full md:w-auto min-w-max">
                    <Filter className="w-3 h-3 lg:w-4 lg:h-4 text-slate-300 dark:text-slate-600" />
                    <span className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filtres</span>
                </div>
            </div>


        </div>
    );
}

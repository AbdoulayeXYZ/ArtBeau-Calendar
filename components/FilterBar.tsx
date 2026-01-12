import { Dispatch, SetStateAction } from 'react';

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

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            {/* Période Selector (Tabs Style) */}
            <div className="w-full md:w-auto p-1 bg-slate-100/80 rounded-lg flex gap-1">
                <button
                    onClick={() => setPeriod('today')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'today'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    Aujourd&apos;hui
                </button>
                <button
                    onClick={() => setPeriod('week')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'week'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    Cette semaine
                </button>
                <button
                    onClick={() => setPeriod('month')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'month'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    Ce mois
                </button>
            </div>

            <div className="w-full md:w-auto h-px md:h-8 bg-slate-200 mx-2" />

            {/* Toggles */}
            <div className="flex gap-4 w-full md:w-auto">
                {/* Loge BG Filter */}
                <button
                    onClick={() => setLogeBgOnly(!logeBgOnly)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${logeBgOnly
                            ? 'bg-secondary text-white border-secondary shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                >
                    <svg className={`w-4 h-4 ${logeBgOnly ? 'text-white' : 'text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Loge à BG
                </button>

                {/* Available Now Filter */}
                <button
                    onClick={() => setAvailableNowOnly(!availableNowOnly)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${availableNowOnly
                            ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${availableNowOnly ? 'bg-white animate-pulse' : 'bg-teal-500'}`}></div>
                    Dispo maintenant
                </button>
            </div>
        </div>
    );
}

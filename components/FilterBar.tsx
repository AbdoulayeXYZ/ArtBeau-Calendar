'use client';

interface FilterBarProps {
    period: string;
    logeBgFilter: string;
    availableNow: boolean;
    onPeriodChange: (period: string) => void;
    onLogeBgChange: (filter: string) => void;
    onAvailableNowToggle: () => void;
}

export default function FilterBar({
    period,
    logeBgFilter,
    availableNow,
    onPeriodChange,
    onLogeBgChange,
    onAvailableNowToggle,
}: FilterBarProps) {
    return (
        <div className="glass rounded-xl p-4 space-y-4">
            {/* Period Filters */}
            <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Période</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onPeriodChange('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === ''
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Tout
                    </button>
                    <button
                        onClick={() => onPeriodChange('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'today'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Aujourd&apos;hui
                    </button>
                    <button
                        onClick={() => onPeriodChange('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'week'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Cette semaine
                    </button>
                    <button
                        onClick={() => onPeriodChange('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'month'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Ce mois
                    </button>
                </div>
            </div>

            {/* Loge BG Filter */}
            <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Loge à BG</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onLogeBgChange('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${logeBgFilter === ''
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => onLogeBgChange('true')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${logeBgFilter === 'true'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Oui
                    </button>
                    <button
                        onClick={() => onLogeBgChange('false')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${logeBgFilter === 'false'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Non
                    </button>
                </div>
            </div>

            {/* Available Now Toggle */}
            <div>
                <button
                    onClick={onAvailableNowToggle}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${availableNow
                            ? 'bg-gradient-to-r from-disponible to-disponible/80 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    {availableNow ? '✓ Disponible maintenant' : 'Voir disponibles maintenant'}
                </button>
            </div>
        </div>
    );
}

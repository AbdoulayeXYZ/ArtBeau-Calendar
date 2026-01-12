interface AvailabilityCardProps {
    user: {
        nom: string;
        prenom: string;
    };
    periodeType: 'jour' | 'semaine' | 'mois';
    dateDebut: string;
    dateFin: string;
    statut: 'disponible' | 'indisponible' | 'moyennement';
    horaireText?: string | null;
    logeBg: boolean;
}

const statutConfig = {
    disponible: {
        color: 'bg-disponible',
        textColor: 'text-disponible',
        label: 'Disponible',
        icon: '✓',
    },
    moyennement: {
        color: 'bg-moyennement',
        textColor: 'text-moyennement',
        label: 'Moyennement disponible',
        icon: '~',
    },
    indisponible: {
        color: 'bg-indisponible',
        textColor: 'text-indisponible',
        label: 'Indisponible',
        icon: '✗',
    },
};

const periodeLabels = {
    jour: 'Jour',
    semaine: 'Semaine',
    mois: 'Mois',
};

export default function AvailabilityCard({
    user,
    periodeType,
    dateDebut,
    dateFin,
    statut,
    horaireText,
    logeBg,
}: AvailabilityCardProps) {
    const config = statutConfig[statut];

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="glass rounded-xl p-5 hover:shadow-xl transition-all duration-300 border-l-4" style={{ borderLeftColor: config.color.replace('bg-', '#') }}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800">
                        {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-slate-500">{periodeLabels[periodeType]}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${config.color} text-white text-sm font-medium flex items-center gap-1`}>
                    <span>{config.icon}</span>
                    <span className="hidden sm:inline">{config.label}</span>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">📅</span>
                    <span>
                        {formatDate(dateDebut)} {dateDebut !== dateFin && `→ ${formatDate(dateFin)}`}
                    </span>
                </div>

                {horaireText && (
                    <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium">🕐</span>
                        <span>{horaireText}</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="font-medium">🏠</span>
                    <span className={`text-sm font-medium ${logeBg ? 'text-primary' : 'text-slate-400'}`}>
                        {logeBg ? 'Loge à BG' : 'Pas de loge'}
                    </span>
                </div>
            </div>
        </div>
    );
}

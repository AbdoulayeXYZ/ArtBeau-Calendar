'use client';

import { CheckCircle2, AlertCircle, X, BedDouble } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MemberCardProps {
    member: {
        nom: string;
        prenom: string;
        username: string;
    };
    availability: Array<{
        id: number;
        statut: 'disponible' | 'indisponible' | 'moyennement';
        horaireText: string;
        logeBg: boolean;
    }>;
}

export default function MemberCard({ member, availability }: MemberCardProps) {
    const hasAvailability = availability.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-black text-lg uppercase border-2 border-primary/20">
                    {member.prenom[0]}{member.nom[0]}
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                        {member.prenom} {member.nom}
                    </h3>
                    <p className="text-xs text-slate-400">@{member.username}</p>
                </div>
            </div>

            {/* Availability Slots */}
            {hasAvailability ? (
                <div className="space-y-2">
                    {availability.map((slot) => (
                        <div
                            key={slot.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border-2",
                                slot.statut === 'disponible'
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20"
                                    : slot.statut === 'moyennement'
                                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500/20"
                                        : "bg-rose-50 dark:bg-rose-500/10 border-rose-500/20"
                            )}
                        >
                            {/* Icon */}
                            {slot.statut === 'disponible' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : slot.statut === 'moyennement' ? (
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            ) : (
                                <X className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                            )}

                            {/* Time */}
                            <div className="flex-1">
                                <p className={cn(
                                    "font-bold text-sm",
                                    slot.statut === 'disponible'
                                        ? "text-emerald-900 dark:text-emerald-300"
                                        : slot.statut === 'moyennement'
                                            ? "text-amber-900 dark:text-amber-300"
                                            : "text-rose-900 dark:text-rose-300"
                                )}>
                                    {slot.horaireText}
                                </p>
                                <p className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    slot.statut === 'disponible'
                                        ? "text-emerald-600 dark:text-emerald-500"
                                        : slot.statut === 'moyennement'
                                            ? "text-amber-600 dark:text-amber-500"
                                            : "text-rose-600 dark:text-rose-500"
                                )}>
                                    {slot.statut === 'disponible' ? 'Disponible' : slot.statut === 'moyennement' ? 'Partiel' : 'Absent'}
                                </p>
                            </div>

                            {/* Sleeper Badge */}
                            {slot.logeBg && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                    <BedDouble className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase">Dortoir</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">Aucune disponibilité</p>
                </div>
            )}
        </motion.div>
    );
}

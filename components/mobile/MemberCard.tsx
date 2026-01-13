'use client';

import { CheckCircle2, AlertCircle, X, BedDouble, ChevronRight } from 'lucide-react';
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
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 p-0.5 shadow-lg shadow-primary/20">
                            <div className="w-full h-full bg-slate-900 rounded-[0.9rem] flex items-center justify-center text-white font-black text-xl uppercase tracking-tighter">
                                {member.prenom[0]}{member.nom[0]}
                            </div>
                        </div>
                        <div className={cn(
                            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900",
                            hasAvailability ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        )} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                            {member.prenom}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Team Collaborator
                        </p>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 group-active:text-primary transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>

            {/* Availability Slots */}
            {hasAvailability ? (
                <div className="space-y-3">
                    {availability.map((slot) => (
                        <div
                            key={slot.id}
                            className={cn(
                                "relative overflow-hidden flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all duration-300",
                                slot.statut === 'disponible'
                                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500/10"
                                    : slot.statut === 'moyennement'
                                        ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-500/10"
                                        : "bg-rose-50/50 dark:bg-rose-500/5 border-rose-500/10"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                                slot.statut === 'disponible' ? "bg-emerald-500 text-white" :
                                    slot.statut === 'moyennement' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                            )}>
                                {slot.statut === 'disponible' ? <CheckCircle2 className="w-5 h-5" /> :
                                    slot.statut === 'moyennement' ? <AlertCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>

                            <div className="flex-1">
                                <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                                    {slot.horaireText}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        slot.statut === 'disponible' ? "text-emerald-600" :
                                            slot.statut === 'moyennement' ? "text-amber-600" : "text-rose-600"
                                    )}>
                                        {slot.statut === 'disponible' ? 'FULL ACTIVE' : slot.statut === 'moyennement' ? 'PARTIAL' : 'NOT AVAILABLE'}
                                    </span>
                                    {slot.logeBg && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                            <BedDouble className="w-3 h-3 text-primary" />
                                            <span className="text-[8px] font-black text-primary uppercase">Dortoir</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No slots today</p>
                </div>
            )}
        </motion.div>
    );
}

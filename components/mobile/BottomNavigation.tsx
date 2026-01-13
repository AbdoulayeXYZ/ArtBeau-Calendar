'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, UserCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/calendrier', icon: Calendar, label: 'Calendrier' },
    { href: '/dailycheck', icon: MessageSquare, label: 'Daily' },
    { href: '/ma-disponibilite', icon: UserCircle, label: 'Dispo' },
];

export default function BottomNavigation() {
    const pathname = usePathname();

    // Don't show on login page or home
    if (pathname === '/login' || pathname === '/') return null;

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
            <nav className="bg-slate-900/80 dark:bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden">
                <div className="flex justify-around items-center px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex-1 group"
                            >
                                <div className={cn(
                                    "flex flex-col items-center justify-center py-3 rounded-[1.8rem] transition-all duration-500",
                                    isActive ? "text-white" : "text-slate-500"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-x-1 inset-y-1 bg-primary rounded-[1.8rem] -z-10 shadow-lg shadow-primary/40"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={cn(
                                        "w-5 h-5 mb-1 transition-transform duration-300 relative z-10",
                                        isActive ? "scale-110" : "group-hover:scale-110"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.1em] relative z-10",
                                        isActive ? "opacity-100" : "opacity-60"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            {/* Safe Area Spacer for modern iPhones */}
            <div className="h-2 w-full" />
        </div>
    );
}

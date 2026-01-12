'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, UserCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/calendrier', icon: Calendar, label: 'Calendrier' },
    { href: '/ma-disponibilite', icon: UserCircle, label: 'Ma Dispo' },
    // { href: '/profile', icon: Settings, label: 'Profil' },
];

export default function BottomNavigation() {
    const pathname = usePathname();

    // Don't show on login page
    if (pathname === '/login' || pathname === '/') return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                                isActive
                                    ? "text-primary dark:text-primary"
                                    : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            <Icon className={cn(
                                "w-6 h-6 mb-1",
                                isActive && "scale-110"
                            )} />
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isActive && "text-primary dark:text-primary"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

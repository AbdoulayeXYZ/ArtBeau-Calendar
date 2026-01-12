'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    UserCircle,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
    user: {
        nom: string;
        prenom: string;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: '/calendrier', label: 'Calendrier Équipe', icon: CalendarDays },
        { href: '/ma-disponibilite', label: 'Ma disponibilité', icon: UserCircle },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/calendrier" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
                            <div className="relative h-12 w-auto aspect-[3/1]">
                                <Image
                                    src="/logohorizontal.png"
                                    alt="Art'Beau Calendar"
                                    width={180}
                                    height={60}
                                    className="object-contain h-12 w-auto filter drop-shadow-sm"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm overflow-hidden group",
                                        active
                                            ? "text-primary bg-primary/5"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", active ? "text-primary" : "text-slate-400")} />
                                    {link.label}
                                    {active && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile & Logout */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="h-8 w-px bg-slate-200 mx-2" />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                                        {user.prenom} {user.nom}
                                    </p>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                                        Collaborateur
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white/50 transition-transform duration-300 hover:scale-105">
                                    {user.prenom[0]}{user.nom[0]}
                                </div>
                            </div>
                        ) : (
                            <div className="w-24 h-5 bg-slate-100 animate-pulse rounded-full" />
                        )}

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 group shadow-sm bg-white border border-slate-100"
                            title="Se déconnecter"
                        >
                            <LogOut className={cn("w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5", isLoggingOut && "animate-pulse")} />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        {user && (
                            <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
                                {user.prenom[0]}{user.nom[0]}
                            </div>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 active:scale-95 transition-all shadow-sm"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden overflow-hidden bg-white border-t border-slate-100"
                    >
                        <div className="px-4 py-6 space-y-3">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all font-semibold",
                                            active ? "bg-primary/5 text-primary" : "bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            {link.label}
                                        </div>
                                        <ChevronRight className={cn("w-4 h-4 opacity-50", active && "text-primary opacity-100")} />
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-slate-100 my-4" />

                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold active:scale-[0.98] transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Se déconnecter
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

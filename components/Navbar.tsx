'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    UserCircle,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Sun,
    Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar({ user }: { user: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const navLinks = [
        { name: 'Calendrier Équipe', href: '/calendrier', icon: CalendarDays },
        { name: 'Ma Disponibilité', href: '/ma-disponibilite', icon: UserCircle },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full px-4 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-[2.5rem] px-6 py-3 border-white/40 shadow-2xl pointer-events-auto h-20">

                {/* Logo Section */}
                <Link href="/calendrier" className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 bg-white rounded-2xl p-2 shadow-lg border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/iconlogo.png"
                            alt="Art'Beau"
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">Art&apos;Beau-Calendar</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-2 overflow-hidden",
                                    isActive ? "text-primary bg-slate-50/50 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                )}
                            >
                                <link.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute bottom-1 left-6 right-6 h-0.5 bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* User Action */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all shadow-sm border border-transparent dark:border-slate-700"
                        title={isDark ? "Passer au clair" : "Passer au sombre"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <AnimatePresence mode='wait'>
                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200/50 dark:border-slate-700">
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.prenom}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">@ {user.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 bg-slate-900 dark:bg-primary text-white rounded-2xl hover:bg-primary dark:hover:bg-primary-light transition-all shadow-xl hover:shadow-primary/20 active:scale-90"
                                    title="Déconnexion"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="p-3 bg-slate-900 dark:bg-primary text-white rounded-2xl hover:bg-primary transition-all"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        )}
                    </AnimatePresence>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden mt-4 glass rounded-[2rem] p-4 flex flex-col gap-2 border-white/40 shadow-2xl pointer-events-auto"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl font-black text-sm transition-all",
                                    pathname === link.href ? "bg-primary/10 text-primary" : "text-slate-600 active:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-30" />
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

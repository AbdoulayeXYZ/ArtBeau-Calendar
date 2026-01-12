'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
    user: {
        nom: string;
        prenom: string;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/calendrier" className="flex items-center gap-2">
                            <div className="relative h-10 w-auto aspect-[3/1]">
                                <Image
                                    src="/logohorizontal.png"
                                    alt="Art'Beau Calendar"
                                    width={180}
                                    height={60}
                                    className="object-contain h-10 w-auto"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link
                            href="/calendrier"
                            className={`px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 text-sm ${isActive('/calendrier')
                                ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span>📅</span>
                            Calendrier Équipe
                        </Link>
                        <Link
                            href="/ma-disponibilite"
                            className={`px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 text-sm ${isActive('/ma-disponibilite')
                                ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span>✏️</span>
                            Ma disponibilité
                        </Link>
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {user.prenom} {user.nom}
                                    </p>
                                    <p className="text-xs text-primary font-medium tracking-wide">Collaborateur</p>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                                    {user.prenom[0]}{user.nom[0]}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse"></div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            title="Se déconnecter"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-3 flex space-x-2 border-t border-slate-100 pt-2">
                    <Link
                        href="/calendrier"
                        className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${isActive('/calendrier')
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600'
                            }`}
                    >
                        📅 Calendrier
                    </Link>
                    <Link
                        href="/ma-disponibilite"
                        className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${isActive('/ma-disponibilite')
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600'
                            }`}
                    >
                        ✏️ Ma dispo
                    </Link>
                </div>
            </div>
        </nav>
    );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
    user: {
        nom: string;
        prenom: string;
    };
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
        <nav className="glass border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Art&apos;Beau-Calendar
                        </h1>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/ma-disponibilite"
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive('/ma-disponibilite')
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-700 hover:bg-primary/10'
                                }`}
                        >
                            Ma disponibilité
                        </Link>
                        <Link
                            href="/calendrier"
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive('/calendrier')
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-700 hover:bg-primary/10'
                                }`}
                        >
                            Calendrier équipe
                        </Link>
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-slate-800">
                                {user.prenom} {user.nom}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? 'Déconnexion...' : 'Déconnexion'}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-3 flex space-x-2">
                    <Link
                        href="/ma-disponibilite"
                        className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/ma-disponibilite')
                                ? 'bg-primary text-white'
                                : 'text-slate-700 bg-slate-100'
                            }`}
                    >
                        Ma dispo
                    </Link>
                    <Link
                        href="/calendrier"
                        className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/calendrier')
                                ? 'bg-primary text-white'
                                : 'text-slate-700 bg-slate-100'
                            }`}
                    >
                        Calendrier
                    </Link>
                </div>
            </div>
        </nav>
    );
}

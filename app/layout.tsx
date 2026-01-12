import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import BottomNavigation from '@/components/mobile/BottomNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: "Art'Beau Calendar",
    description: "Gestion des disponibilités d'équipe",
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className="dark">
            <body className={inter.className}>
                {children}
                <BottomNavigation />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { dailyChecks, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { format } from 'date-fns';

// GET: Récupère les checks de la journée en cours
export async function GET() {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');

        // Récupérer tous les checks d'aujourd'hui avec les infos utilisateurs
        const checks = await db
            .select({
                id: dailyChecks.id,
                hier: dailyChecks.hier,
                aujourdhui: dailyChecks.aujourdhui,
                blocages: dailyChecks.blocages,
                meteo: dailyChecks.meteo,
                createdAt: dailyChecks.createdAt,
                user: {
                    id: users.id,
                    nom: users.nom,
                    prenom: users.prenom,
                    username: users.username,
                },
            })
            .from(dailyChecks)
            .innerJoin(users, eq(dailyChecks.userId, users.id))
            .where(eq(dailyChecks.date, today))
            .orderBy(dailyChecks.createdAt);

        // Récupérer tous les utilisateurs pour savoir qui n'a pas encore soumis
        const allUsers = await db.select({
            id: users.id,
            nom: users.nom,
            prenom: users.prenom,
            username: users.username,
        }).from(users);

        return NextResponse.json({
            checks,
            allUsers,
            today
        });
    } catch (error) {
        console.error('Get daily checks error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des checks' },
            { status: 500 }
        );
    }
}

// POST: Soumettre un daily check
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { hier, aujourdhui, blocages, meteo } = body;

        // Validation
        if (!hier || !aujourdhui || !blocages || meteo === undefined) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            );
        }

        const today = format(new Date(), 'yyyy-MM-dd');

        // Vérifier si l'utilisateur a déjà soumis aujourd'hui
        const [existing] = await db
            .select()
            .from(dailyChecks)
            .where(
                and(
                    eq(dailyChecks.userId, user.id),
                    eq(dailyChecks.date, today)
                )
            )
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: 'Vous avez déjà soumis votre check aujourd\'hui' },
                { status: 400 }
            );
        }

        // Insérer le nouveau check
        const [newCheck] = await db
            .insert(dailyChecks)
            .values({
                userId: user.id,
                date: today,
                hier,
                aujourdhui,
                blocages,
                meteo: parseInt(meteo),
            })
            .returning();

        return NextResponse.json({
            success: true,
            check: newCheck,
        });
    } catch (error) {
        console.error('Post daily check error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la soumission du check' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { availability, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET: Récupérer les disponibilités (avec filtres optionnels)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period'); // 'today', 'week', 'month'
        const logeBgFilter = searchParams.get('loge_bg'); // 'true', 'false', null
        const availableNow = searchParams.get('available_now'); // 'true', null

        const conditions: any[] = [];

        // Filter by period
        if (period) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (period === 'today') {
                conditions.push(
                    and(
                        lte(availability.dateDebut, today.toISOString().split('T')[0]),
                        gte(availability.dateFin, today.toISOString().split('T')[0])
                    )
                );
            } else if (period === 'week') {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                conditions.push(
                    and(
                        lte(availability.dateDebut, weekEnd.toISOString().split('T')[0]),
                        gte(availability.dateFin, weekStart.toISOString().split('T')[0])
                    )
                );
            } else if (period === 'month') {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                conditions.push(
                    and(
                        lte(availability.dateDebut, monthEnd.toISOString().split('T')[0]),
                        gte(availability.dateFin, monthStart.toISOString().split('T')[0])
                    )
                );
            }
        }

        // Filter by loge_bg
        if (logeBgFilter !== null) {
            conditions.push(eq(availability.logeBg, logeBgFilter === 'true'));
        }

        // Filter by available now (considers current time)
        if (availableNow === 'true') {
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            conditions.push(
                and(
                    eq(availability.statut, 'disponible'),
                    lte(availability.dateDebut, today),
                    gte(availability.dateFin, today)
                )
            );

            // Note: Time filtering is done on the client side since horaireText 
            // is stored as text and would require complex SQL parsing
        }

        // Build query
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const results = await db
            .select({
                id: availability.id,
                periodeType: availability.periodeType,
                dateDebut: availability.dateDebut,
                dateFin: availability.dateFin,
                statut: availability.statut,
                horaireText: availability.horaireText,
                logeBg: availability.logeBg,
                createdAt: availability.createdAt,
                updatedAt: availability.updatedAt,
                user: {
                    id: users.id,
                    username: users.username,
                    nom: users.nom,
                    prenom: users.prenom,
                },
            })
            .from(availability)
            .leftJoin(users, eq(availability.userId, users.id))
            .where(whereClause)
            .orderBy(availability.dateDebut);

        return NextResponse.json({ availability: results });
    } catch (error) {
        console.error('Get availability error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des disponibilités' },
            { status: 500 }
        );
    }
}

// POST: Créer ou mettre à jour une disponibilité
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
        const { periodeType, dateDebut, dateFin, statut, horaireText, logeBg } = body;

        // Validation
        if (!periodeType || !dateDebut || !dateFin || !statut) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            );
        }

        // Delete existing availability for this user in the same period
        await db
            .delete(availability)
            .where(
                and(
                    eq(availability.userId, user.id),
                    lte(availability.dateDebut, dateFin),
                    gte(availability.dateFin, dateDebut)
                )
            );

        // Create new availability
        const [newAvailability] = await db
            .insert(availability)
            .values({
                userId: user.id,
                periodeType,
                dateDebut,
                dateFin,
                statut,
                horaireText: horaireText || null,
                logeBg: logeBg || false,
            })
            .returning();

        return NextResponse.json({
            success: true,
            availability: newAvailability,
        });
    } catch (error) {
        console.error('Create availability error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la disponibilité' },
            { status: 500 }
        );
    }
}

// DELETE: Supprimer une disponibilité
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID manquant' },
                { status: 400 }
            );
        }

        // Verify ownership and delete
        const result = await db
            .delete(availability)
            .where(
                and(
                    eq(availability.id, parseInt(id)),
                    eq(availability.userId, user.id)
                )
            )
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Disponibilité non trouvée ou non autorisée' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Disponibilité supprimée avec succès'
        });
    } catch (error) {
        console.error('Delete availability error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}

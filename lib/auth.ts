import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db/db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ userId, token: sessionToken }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    });

    return sessionToken;
}

export async function getSession(): Promise<{ userId: number; token: string } | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
        return null;
    }

    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    return user || null;
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

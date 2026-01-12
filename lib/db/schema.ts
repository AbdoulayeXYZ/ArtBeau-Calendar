import { pgTable, serial, text, timestamp, varchar, boolean, date, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const periodeTypeEnum = pgEnum('periode_type', ['jour', 'semaine', 'mois']);
export const statutEnum = pgEnum('statut', ['disponible', 'indisponible', 'moyennement']);

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    nom: varchar('nom', { length: 100 }).notNull(),
    prenom: varchar('prenom', { length: 100 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Availability table
export const availability = pgTable('availability', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id).notNull(),
    periodeType: periodeTypeEnum('periode_type').notNull(),
    dateDebut: date('date_debut').notNull(),
    dateFin: date('date_fin').notNull(),
    statut: statutEnum('statut').notNull(),
    horaireText: varchar('horaire_text', { length: 100 }),
    logeBg: boolean('loge_bg').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Availability = typeof availability.$inferSelect;
export type NewAvailability = typeof availability.$inferInsert;

import 'dotenv/config';
import { db } from '../lib/db/db';
import { users } from '../lib/db/schema';
import { hashPassword } from '../lib/auth';

const usersToSeed = [
    { nom: 'BA', prenom: 'Adama Guimar', username: 'baadama', password: '4827' },
    { nom: 'CISSÉ', prenom: 'Cheikh Awa Balla', username: 'cissecheikhawa', password: '7391' },
    { nom: 'DIALLO', prenom: 'Aminatou Djiri', username: 'dialloaminatoudjiri', password: '1058' },
    { nom: 'DIOP', prenom: 'Mamadou Lamine', username: 'diopmamadoulamine', password: '2649' },
    { nom: 'DIOP', prenom: 'Mouhamadou', username: 'diopmouhamadou', password: '8173' },
    { nom: 'DIOP', prenom: 'Ndeye Aïssa', username: 'diopndeyeaissa', password: '5904' },
    { nom: 'FALL', prenom: 'Mariama', username: 'fallmariama', password: '3461' },
    { nom: 'FAYE GUENE', prenom: 'Maïmouna', username: 'guenemaimouna', password: '7285' },
    { nom: 'KAMARA', prenom: 'Maïmouna', username: 'kamaramaimouna', password: '9142' },
    { nom: 'MBACKÉ', prenom: 'Mominatou', username: 'mbackemominatou', password: '6037' },
    { nom: 'MBAYE', prenom: 'Moussa', username: 'mbayemoussa', password: '4519' },
    { nom: 'MBAYE', prenom: 'Aïcha', username: 'mbayeaicha', password: '8820' },
    { nom: 'FALL NDIAYE', prenom: 'Fatima', username: 'ndiayefatimafall', password: '1974' },
    { nom: 'NIANG', prenom: 'El Hadji Samba', username: 'niangelhadjisamba', password: '5608' },
    { nom: 'NIASSE', prenom: 'Abdoulaye', username: 'niasseabdoulaye', password: '3346' },
    { nom: 'SARR', prenom: 'Fatou Bintou', username: 'sarrfatoubintou', password: '7015' },
    { nom: 'SARR', prenom: 'Mouhamadou', username: 'sarrmouhamadou', password: '2498' },
    { nom: 'SARR', prenom: 'Aby', username: 'sarraby', password: '8651' },
    { nom: 'SEYE', prenom: 'Baye Daouda', username: 'seyebayedaouda', password: '4120' },
    { nom: 'THIAM', prenom: 'Assane', username: 'thiamassane', password: '9763' },
];

async function seed() {
    console.log('🌱 Starting database seed...');

    try {
        for (const userData of usersToSeed) {
            console.log(`Creating user: ${userData.username}...`);

            const passwordHash = await hashPassword(userData.password);

            await db.insert(users).values({
                username: userData.username,
                nom: userData.nom,
                prenom: userData.prenom,
                passwordHash,
            });

            console.log(`✓ Created: ${userData.prenom} ${userData.nom} (${userData.username})`);
        }

        console.log('\n✅ Database seeded successfully!');
        console.log(`📊 Created ${usersToSeed.length} users`);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();

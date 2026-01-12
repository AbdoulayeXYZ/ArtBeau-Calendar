# Art'Beau-Calendar 📅

Plateforme moderne de gestion des disponibilités d'équipe, déployable en moins de 2 heures.

## 🚀 Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: Vercel Postgres
- **ORM**: Drizzle ORM
- **Authentification**: Session-based (cookies)
- **Déploiement**: Vercel

## ✨ Fonctionnalités

### MVP (< 2h)
- ✅ Connexion simple (username/password)
- ✅ Déclaration de disponibilité (jour/semaine/mois)
- ✅ Calendrier partagé de l'équipe
- ✅ Filtres (période, loge BG, disponible maintenant)
- ✅ Design moderne avec glassmorphism
- ✅ Responsive (mobile/desktop)

## 📦 Installation Locale

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials Vercel Postgres
```

## 🗄️ Configuration de la Base de Données

### 1. Créer une base Vercel Postgres

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Aller dans l'onglet "Storage"
4. Créer une nouvelle base de données Postgres
5. Copier les variables d'environnement

### 2. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 3. Pousser le schéma et initialiser les utilisateurs

```bash
# Pousser le schéma vers Vercel Postgres
npm run db:push

# Créer les 20 comptes utilisateurs
npm run seed
```

## 👥 Comptes Utilisateurs

20 comptes sont automatiquement créés lors du seed :

| Nom | Username | Mot de passe |
|-----|----------|--------------|
| Adama Guimar BA | `baadama` | `4827` |
| Cheikh Awa Balla CISSÉ | `cissecheikhawa` | `7391` |
| Aminatou Djiri DIALLO | `dialloaminatoudjiri` | `1058` |
| Mamadou Lamine DIOP | `diopmamadoulamine` | `2649` |
| Mouhamadou DIOP | `diopmouhamadou` | `8173` |
| Ndeye Aïssa DIOP | `diopndeyeaissa` | `5904` |
| Mariama FALL | `fallmariama` | `3461` |
| Maïmouna FAYE GUENE | `guenemaimouna` | `7285` |
| Maïmouna KAMARA | `kamaramaimouna` | `9142` |
| Mominatou MBACKÉ | `mbackemominatou` | `6037` |
| Moussa MBAYE | `mbayemoussa` | `4519` |
| Aïcha MBAYE | `mbayeaicha` | `8820` |
| Fatima FALL NDIAYE | `ndiayefatimafall` | `1974` |
| El Hadji Samba NIANG | `niangelhadjisamba` | `5608` |
| Abdoulaye NIASSE | `niasseabdoulaye` | `3346` |
| Fatou Bintou SARR | `sarrfatoubintou` | `7015` |
| Mouhamadou SARR | `sarrmouhamadou` | `2498` |
| Aby SARR | `sarraby` | `8651` |
| Baye Daouda SEYE | `seyebayedaouda` | `4120` |
| Assane THIAM | `thiamassane` | `9763` |

## 🏃‍♂️ Lancer en Local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🚢 Déploiement sur Vercel

### Méthode 1 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Méthode 2 : Via GitHub

1. Pousser le code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com/new)
3. Vercel détectera automatiquement Next.js
4. Ajouter les variables d'environnement dans les settings
5. Déployer !

### Variables d'environnement sur Vercel

Dans le dashboard Vercel, ajouter toutes les variables `POSTGRES_*` depuis votre base Vercel Postgres.

## 📁 Structure du Projet

```
artbeaucalendar/
├── app/
│   ├── api/
│   │   ├── auth/          # Routes d'authentification
│   │   └── availability/  # Routes de disponibilité
│   ├── login/             # Page de connexion
│   ├── ma-disponibilite/  # Page de déclaration
│   ├── calendrier/        # Page calendrier équipe
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout racine
│   └── page.tsx           # Page d'accueil (redirect)
├── components/
│   ├── Navbar.tsx         # Navigation
│   ├── AvailabilityCard.tsx # Carte de disponibilité
│   └── FilterBar.tsx      # Barre de filtres
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Schéma Drizzle
│   │   └── db.ts          # Client DB
│   └── auth.ts            # Utilitaires auth
├── scripts/
│   └── seed.ts            # Script de seed
└── drizzle.config.ts      # Config Drizzle Kit
```

## 🎨 Design

- **Couleurs principales** : Teal (`#008080`) et Navy (`#003366`)
- **Couleurs de statut** :
  - Vert : Disponible
  - Orange : Moyennement disponible
  - Rouge : Indisponible
- **Effets** : Glassmorphism, animations micro-interactions
- **Font** : Inter (Google Fonts)

## 🔄 Scripts NPM

```bash
npm run dev         # Serveur de développement
npm run build       # Build production
npm run start       # Serveur production
npm run lint        # Linter ESLint
npm run db:push     # Pousser le schéma DB
npm run db:studio   # Ouvrir Drizzle Studio
npm run seed        # Créer les utilisateurs
```

## 🛣️ Roadmap (Post-MVP)

- [ ] Rôles admin/user
- [ ] Notifications email
- [ ] Historique des modifications
- [ ] Export Excel/PDF du calendrier
- [ ] Intégration Google Calendar
- [ ] Application mobile (React Native)
- [ ] Dashboard analytics
- [ ] API publique

## 📄 Licence

Propriété de Art'Beau © 2026

---

**Développé avec ❤️ pour une gestion d'équipe efficace**

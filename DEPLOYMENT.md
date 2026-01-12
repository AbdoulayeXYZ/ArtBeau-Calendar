# Guide de Déploiement Vercel - Art'Beau-Calendar

## 📋 Prérequis

- Compte Vercel (gratuit) : https://vercel.com/signup
- Code poussé sur GitHub/GitLab/Bitbucket

## 🚀 Étapes de Déploiement

### 1. Créer la Base de Données Vercel Postgres

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "Storage" dans la barre latérale
3. Cliquer sur "Create Database"
4. Sélectionner "Postgres"
5. Choisir la région la plus proche de vos utilisateurs (ex: Europe pour Dakar)
6. Créer la base
7. **Noter les variables d'environnement** qui s'affichent

### 2. Déployer l'Application

#### Option A : Via l'Interface Vercel (Recommandé)

1. Aller sur https://vercel.com/new
2. Importer votre repository Git
3. Vercel détectera automatiquement Next.js
4. **NE PAS déployer tout de suite !** Cliquer sur "Environment Variables"
5. Ajouter toutes les variables Postgres de l'étape 1 :
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`
6. Cliquer sur "Deploy"
7. Attendre 2-3 minutes

#### Option B : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel --prod

# Suivre les instructions pour lier au projet et ajouter les env vars
```

### 3. Initialiser la Base de Données

Une fois déployé :

#### Méthode 1 : Localement (Recommandé)

```bash
# 1. Connecter le projet local à Vercel
vercel link

# 2. Télécharger les variables d'environnement
vercel env pull .env.local

# 3. Pousser le schéma
npm run db:push

# 4. Créer les utilisateurs
npm run seed
```

#### Méthode 2 : Via un script de déploiement

Créer un fichier `scripts/deploy-db.sh` :

```bash
#!/bin/bash
echo "🚀 Initializing database..."
npm run db:push
npm run seed
echo "✅ Database ready!"
```

Exécuter sur votre machine locale (avec les env vars configurées).

### 4. Vérifier le Déploiement

1. Accéder à l'URL Vercel (ex: `artbeaucalendar.vercel.app`)
2. Vous devriez être redirigé vers `/login`
3. Tester la connexion avec un des comptes :
   - Username : `niasseabdoulaye`
   - Password : `3346`
4. Déclarer une disponibilité
5. Voir le calendrier

## 🔧 Configuration Post-Déploiement

### Ajouter un Domaine Personnalisé

1. Dans le dashboard Vercel, aller dans "Settings" > "Domains"
2. Ajouter votre domaine (ex: `calendar.artbeau.sn`)
3. Suivre les instructions DNS

### Activer les Analytics

1. Dans "Analytics", activer Vercel Analytics
2. Gratuit jusqu'à 100k requêtes/mois

### Configurer les Logs

1. Aller dans "Logs" pour voir les erreurs en production
2. Activer l'intégration Slack/Discord pour les alertes

## 🐛 Troubleshooting

### Erreur : "Cannot connect to database"

- Vérifier que toutes les variables `POSTGRES_*` sont configurées
- Vérifier qu'il n'y a pas d'espaces dans les valeurs

### Erreur : "Table does not exist"

- Exécuter `npm run db:push` depuis votre machine locale
- Les migrations ne s'exécutent PAS automatiquement sur Vercel

### Les utilisateurs ne peuvent pas se connecter

- Vérifier que `npm run seed` a été exécuté
- Vérifier dans Drizzle Studio : `npm run db:studio`

## 📊 Monitoring

### Voir les Données en Production

```bash
# Ouvrir Drizzle Studio connecté à la prod
npm run db:studio
```

### Logs Temps Réel

```bash
vercel logs --follow
```

## 🔄 Déploiements Futurs

Chaque push sur la branche `main` déclenchera automatiquement un nouveau déploiement !

```bash
git add .
git commit -m "amélioration X"
git push origin main
# → Déploiement automatique sur Vercel
```

## 🎯 Checklist de Déploiement

- [ ] Base Vercel Postgres créée
- [ ] Variables d'environnement configurées
- [ ] Application déployée
- [ ] Schéma DB poussé (`npm run db:push`)
- [ ] Utilisateurs créés (`npm run seed`)
- [ ] Login testé
- [ ] Disponibilité testée
- [ ] Calendrier testé
- [ ] (Optionnel) Domaine personnalisé configuré

## 📞 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Vérifier la console du navigateur
3. Tester la connexion DB avec Drizzle Studio

---

**Temps Total Estimé : 15-20 minutes** ⚡

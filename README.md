# Abricot — Installation

Ce projet comporte deux applications :
- **Backend** : API REST Node.js / Express / TypeScript, avec Prisma et SQLite.
- **Frontend** : application Next.js / React / TypeScript.

Les deux applications doivent être installées et démarrées séparément.

## 1. Prérequis

Installer :
- Node.js 24 LTS avec npm
- Git
- Un terminal (Git Bash, PowerShell ou Linux/macOS)

Vérifier les versions :

```bash
node --version
npm --version
git --version
```

## 2. Récupérer le projet

```bash
git clone https://github.com/HB3317/OC-P7-Abricot.git
cd OC-P7-Abricot
```

## 3. Installation du backend

Depuis la racine du projet :

```bash
cd backend
npm ci
```

### Configuration

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

Le fichier `backend/.env` doit contenir :

```env
DATABASE_URL="file:./db.sqlite"
JWT_SECRET="your-secret-key"
```

Remplacer `your-secret-key` par une clé secrète longue et aléatoire.

### Initialisation de la base de données

```bash
npx prisma generate
npx prisma migrate deploy
```

Ces commandes génèrent le client Prisma, créent la base SQLite si nécessaire et appliquent les migrations existantes.

### Données de démonstration (facultatif)

```bash
npm run seed
```

Le script crée 10 utilisateurs, 5 projets, 17 tâches et leurs commentaires.

**Attention : le seed supprime les données existantes avant de recréer les données de démonstration.**

### Démarrage

```bash
npm run dev
```

Le serveur backend démarre sur :

- API : http://localhost:8000
- Documentation Swagger : http://localhost:8000/api-docs

Conserver ce terminal ouvert.

## 4. Installation du frontend

Ouvrir un second terminal à la racine du projet :

```bash
cd frontend
npm ci
```

### Configuration

```bash
cp .env.example .env.local
```

Le fichier `frontend/.env.local` doit contenir :

```env
API_SERVER_URL=http://localhost:8000
```

### Démarrage

```bash
npm run dev
```

Ouvrir http://localhost:3000 dans un navigateur.

Les deux serveurs doivent rester démarrés pour utiliser l'application.

## 5. Connexion

Après exécution du seed, utiliser le compte de démonstration :

- **Email** : `alice@example.com`
- **Mot de passe** : `P@ssword123`

Il est également possible de créer un nouveau compte depuis la page d'inscription.

Ces identifiants de démonstration ne doivent pas être utilisés en production.

## 6. Vérification des compilations

Ces commandes sont facultatives pour démarrer l'application.

Depuis `backend/` :

```bash
npm run build
```

Depuis `frontend/` :

```bash
npm run lint
npm run build
```

## 7. Arrêt des serveurs

Appuyer sur `Ctrl + C` dans chacun des deux terminaux.

## 8. Documentation complémentaire

Consulter `backend/README.md` pour la documentation de l'API, les rôles, les permissions et les données de démonstration.

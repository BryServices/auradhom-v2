# Guide de Configuration Supabase pour Auradhom

Ce guide vous explique comment configurer Supabase comme base de données pour votre application Auradhom.

## 📋 Prérequis

- Un compte Supabase (gratuit) : https://supabase.com
- Node.js et npm installés
- Les dépendances du projet installées (`npm install`)

## 🚀 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Allez sur https://supabase.com et connectez-vous
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : Auradhom (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
4. Cliquez sur "Create new project"
5. Attendez que le projet soit créé (2-3 minutes)

### 2. Obtenir les Clés API

1. Dans le tableau de bord de votre projet Supabase, allez dans **Settings** > **API**
2. Vous verrez deux informations importantes :
   - **Project URL** : L'URL de votre projet (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** : La clé publique anonyme (commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configurer les Variables d'Environnement

1. Ouvrez le fichier `src/environments/environment.ts`
2. Remplacez `YOUR_SUPABASE_URL` par votre **Project URL**
3. Remplacez `YOUR_SUPABASE_ANON_KEY` par votre clé **anon public**

Exemple :
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://xxxxxxxxxxxxx.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxMjM0NTY3LCJleHAiOjE5NTY4MTA1Njd9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};
```

4. Faites de même pour `src/environments/environment.prod.ts` si vous utilisez la production

### 4. Créer les Tables dans Supabase

1. Dans le tableau de bord Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Ouvrez le fichier `supabase-schema.sql` de ce projet
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur "Run" pour exécuter le script
7. Vérifiez que les tables sont créées en allant dans **Table Editor**

### 5. Installer les Dépendances

Si ce n'est pas déjà fait, installez les dépendances :

```bash
npm install
```

Cela installera `@supabase/supabase-js` qui est nécessaire pour se connecter à Supabase.

### 6. Vérifier la Configuration

1. Démarrez l'application en développement :
```bash
npm run dev
```

2. Ouvrez la console du navigateur (F12)
3. Vous devriez voir le message : `✅ Supabase configuré et prêt à l'utilisation.`

Si vous voyez `⚠️ Supabase non configuré. Utilisation de localStorage comme fallback.`, vérifiez que :
- Les clés sont correctement configurées dans `environment.ts`
- Le fichier `environment.ts` est bien sauvegardé
- Vous avez redémarré le serveur de développement

## 🔄 Migration des Données depuis localStorage

Si vous aviez déjà des données dans localStorage, vous pouvez les migrer vers Supabase :

1. Les données seront automatiquement migrées lors de la première utilisation
2. Les nouvelles commandes seront directement sauvegardées dans Supabase
3. Les anciennes données resteront dans localStorage comme backup

## 📊 Structure de la Base de Données

Le script SQL crée trois tables principales :

### 1. `app_config`
Stocke la configuration de l'application :
- Identifiants admin (email, password)
- Numéro WhatsApp
- Dates de création et mise à jour

### 2. `orders`
Stocke toutes les commandes :
- Informations client (JSON)
- Articles de la commande (JSON)
- Statut (pending, validated, rejected)
- Dates et informations de validation/rejet

### 3. `admin_auth`
Stocke les sessions d'authentification admin (optionnel)

## 🔒 Sécurité

### Row Level Security (RLS)

Par défaut, RLS est désactivé pour simplifier le développement. Pour activer la sécurité :

1. Allez dans **Authentication** > **Policies** dans Supabase
2. Activez RLS sur les tables concernées
3. Créez des politiques personnalisées selon vos besoins

**⚠️ Important** : Pour la production, activez RLS et configurez des politiques de sécurité appropriées.

### Clés API

- **anon public** : Clé publique, peut être exposée dans le code frontend
- **service_role** : Clé privée, NE JAMAIS exposer dans le code frontend

## 🐛 Dépannage

### Erreur : "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Erreur : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé (anon public, pas service_role)
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé
- Vérifiez que l'URL est correcte

### Erreur : "relation does not exist"
- Vérifiez que vous avez bien exécuté le script SQL
- Vérifiez que les noms des tables correspondent (orders, app_config, admin_auth)

### Les données ne sont pas sauvegardées
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que Supabase est bien configuré (message dans la console)
- Vérifiez les logs dans le tableau de bord Supabase (Logs > Postgres Logs)

## 📚 Ressources

- Documentation Supabase : https://supabase.com/docs
- Documentation Angular + Supabase : https://supabase.com/docs/guides/getting-started/tutorials/with-angular
- Support Supabase : https://supabase.com/docs/support

## ✅ Vérification Finale

Une fois la configuration terminée, vérifiez que :

- [ ] Les clés Supabase sont configurées dans `environment.ts`
- [ ] Le script SQL a été exécuté avec succès
- [ ] Les tables sont créées dans Supabase
- [ ] L'application démarre sans erreur
- [ ] Le message "✅ Supabase configuré" apparaît dans la console
- [ ] Vous pouvez créer une commande et elle est sauvegardée dans Supabase

## 🎉 Félicitations !

Votre application Auradhom est maintenant configurée avec Supabase ! Les données sont maintenant stockées de manière persistante et partagées entre tous les utilisateurs.


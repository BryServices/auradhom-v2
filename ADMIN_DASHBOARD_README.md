# Dashboard Administrateur - Documentation

## Fonctionnalités implémentées

### 1. Authentification
- Page de connexion à `/admin/login`
- Identifiants par défaut :
  - Email: `admin@auradhom.com`
  - Mot de passe: `admin123`
- Session stockée dans localStorage
- Guard de protection des routes admin

### 2. Gestion des commandes

#### Commandes en attente
- Liste des commandes non validées
- Détails de chaque commande (client, articles, total, date, message WhatsApp)
- Bouton "Valider" pour enregistrer en base de données
- Bouton "Rejeter" avec motif obligatoire

#### Commandes validées
- Historique des commandes validées
- Bouton "Télécharger PDF" pour générer un reçu
- Informations complètes de chaque commande

#### Historique
- Vue de toutes les commandes (en attente, validées, rejetées)
- Filtres de recherche (date, client, statut, numéro de commande)

### 3. Base de données
Les données sont stockées dans localStorage (pour développement). Les tables utilisées :
- `pending_orders` : Commandes en attente
- `validated_orders` : Commandes validées
- `rejected_orders` : Commandes rejetées
- `auradhom_admin_auth` : Session administrateur
- `auradhom_notifications` : Notifications

### 4. Génération PDF
- Bouton "Imprimer le reçu" sur chaque commande validée
- PDF avec :
  - Logo (simulé avec texte)
  - Numéro de commande
  - Date
  - Articles détaillés
  - Prix et total
  - Adresse de livraison

**Note**: Pour utiliser la génération PDF, vous devez installer jsPDF :
```bash
npm install jspdf
npm install --save-dev @types/jspdf
```

### 5. Notifications
- Notification automatique à chaque nouvelle commande WhatsApp
- Badge de notification dans le header du dashboard
- Liste des notifications dans le dropdown
- Marquage automatique comme lues

### 6. Recherche et filtres
- Recherche par nom client ou numéro de commande
- Filtre par date (de/à)
- Filtre par statut (en attente, validée, rejetée)
- Bouton de réinitialisation des filtres

## Installation des dépendances

### jsPDF (pour la génération PDF)
```bash
npm install jspdf
npm install --save-dev @types/jspdf
```

## Structure des fichiers

### Services
- `src/app/services/auth.service.ts` : Gestion de l'authentification
- `src/app/services/order.service.ts` : Gestion des commandes
- `src/app/services/notification.service.ts` : Gestion des notifications
- `src/app/services/pdf.service.ts` : Génération de PDF

### Guards
- `src/app/guards/auth.guard.ts` : Protection des routes admin

### Modèles
- `src/app/models/order.ts` : Modèles de données pour les commandes

### Composants
- `src/app/pages/admin/login/` : Page de connexion
- `src/app/pages/admin/dashboard/` : Dashboard principal
- `src/app/pages/admin/orders-list/` : Liste des commandes
- `src/app/pages/admin/order-detail/` : Détail d'une commande

## Routes

- `/admin/login` : Page de connexion
- `/admin/dashboard` : Dashboard admin (protégé)
- `/admin/dashboard/orders/:id` : Détail d'une commande (protégé)

## Utilisation

### Connexion
1. Accédez à `/admin/login`
2. Entrez les identifiants (admin@auradhom.com / admin123)
3. Vous êtes redirigé vers le dashboard

### Gestion des commandes
1. Les commandes WhatsApp sont automatiquement créées en "en attente"
2. Dans le dashboard, consultez la liste des commandes en attente
3. Cliquez sur "Voir détails" pour voir toutes les informations
4. Validez ou rejetez la commande avec un motif

### Génération PDF
1. Accédez à une commande validée
2. Cliquez sur "Télécharger le reçu PDF"
3. Le PDF est téléchargé automatiquement

## Notes importantes

- Les données sont stockées dans localStorage (développement uniquement)
- Pour la production, migrez vers une vraie base de données (Supabase, Firebase, etc.)
- Changez les identifiants par défaut en production
- Implémentez un vrai système d'authentification (OAuth, JWT, etc.)
- Configurez l'envoi d'emails pour les notifications (backend requis)

## Modification du formulaire client

Le formulaire `customer-info` a été modifié pour :
- Ajouter le champ téléphone (requis)
- Sauvegarder automatiquement les commandes en attente lors de la confirmation
- Conserver le message WhatsApp pour l'administration

## Prochaines étapes recommandées

1. Migrer vers une vraie base de données (Supabase)
2. Implémenter l'authentification OAuth
3. Ajouter l'envoi d'emails pour les notifications
4. Ajouter un logo réel dans les PDF
5. Implémenter des statistiques (revenus, commandes par période, etc.)
6. Ajouter l'export Excel des commandes
7. Implémenter la gestion des produits depuis le dashboard


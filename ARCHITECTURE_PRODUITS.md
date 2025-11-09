# Architecture - Système de Gestion des Produits

## 📋 Table des matières

1. [Architecture globale](#architecture-globale)
2. [Modèles de données](#modèles-de-données)
3. [Services et API](#services-et-api)
4. [Composants UI](#composants-ui)
5. [Routes et navigation](#routes-et-navigation)
6. [Fonctionnalités implémentées](#fonctionnalités-implémentées)
7. [Commandes d'installation](#commandes-dinstallation)

---

## 🏗️ Architecture globale

### Stack technique

- **Frontend**: Angular 17+ (Standalone Components)
- **State Management**: Angular Signals + RxJS
- **Storage**: localStorage (simulation de BD) → Migrable vers PostgreSQL/MongoDB
- **UI**: CSS personnalisé (style AURADHOM)
- **Build**: Angular CLI

### Structure du projet

```
src/app/
├── models/
│   ├── product.ts                    # Modèle de base
│   └── product-extended.ts           # Modèles étendus (variantes, stocks, etc.)
├── services/
│   ├── api.service.ts                # Service API (CRUD produits)
│   ├── admin-product.service.ts      # Service admin produits
│   └── product.service.ts            # Service frontend produits
├── pages/admin/
│   ├── products/
│   │   ├── products-list/            # Liste des produits
│   │   ├── product-form/             # Formulaire création/édition
│   │   ├── product-detail/           # Détails produit
│   │   └── product-filters/          # Filtres avancés
│   └── categories/                   # Gestion catégories
└── guards/
    └── auth.guard.ts                 # Protection routes admin
```

---

## 📊 Modèles de données

### ExtendedProduct

```typescript
interface ExtendedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  pricing: {
    basePrice: number;
    compareAtPrice?: number;
    costPrice?: number;
    currency: string;
  };
  description: string;
  variants: ProductVariant[];
  media: ProductMedia[];
  categoryId?: string;
  tags: ProductTag[];
  totalStock: number;
  seo?: SEOData;
  createdAt: Date;
  updatedAt: Date;
}
```

### ProductVariant

```typescript
interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: { name: string; hex: string };
  sku: string;
  price?: number;
  stock: number;
  image?: string;
  barcode?: string;
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;  // Pour hiérarchie
  order: number;
  isActive: boolean;
  seo?: SEOData;
}
```

### StockMovement

```typescript
interface StockMovement {
  id: string;
  variantId: string;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: string;
  createdAt: Date;
}
```

---

## 🔌 Services et API

### ApiService

**Endpoints produits:**
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer/archiver un produit
- `POST /api/products/:id/duplicate` - Dupliquer un produit
- `GET /api/products/search` - Recherche et filtres

**Endpoints variantes:**
- `POST /api/products/:id/variants` - Ajouter une variante
- `PUT /api/products/:id/variants/:variantId` - Mettre à jour une variante
- `DELETE /api/products/:id/variants/:variantId` - Supprimer une variante

**Endpoints stock:**
- `PUT /api/variants/:id/stock` - Mettre à jour le stock
- `GET /api/variants/:id/history` - Historique des mouvements

**Endpoints catégories:**
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Mettre à jour une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### AdminProductService

Service Angular qui encapsule toutes les opérations CRUD et expose des méthodes typées:

```typescript
// Exemples d'utilisation
productService.createProduct(product).subscribe(...);
productService.searchProducts(filters).subscribe(...);
productService.updateStock(variantId, quantity).subscribe(...);
productService.generateSKU(productName, variant).subscribe(...);
```

---

## 🎨 Composants UI

### 1. ProductsListComponent

**Fichier**: `src/app/pages/admin/products/products-list/products-list.component.ts`

**Fonctionnalités:**
- Liste paginée des produits
- Recherche en temps réel
- Filtres avancés (statut, catégorie, prix, stock)
- Tri par colonnes
- Actions rapides (éditer, dupliquer, supprimer)
- Vue grille/liste

**Template:**
```html
<div class="products-list">
  <div class="filters-bar">
    <input [(ngModel)]="searchQuery" placeholder="Rechercher...">
    <select [(ngModel)]="selectedCategory">
      <option value="">Toutes les catégories</option>
    </select>
    <button (click)="openFilters()">Filtres avancés</button>
  </div>
  
  <table class="products-table">
    <thead>
      <tr>
        <th>Image</th>
        <th>Nom</th>
        <th>SKU</th>
        <th>Prix</th>
        <th>Stock</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      @for (product of products(); track product.id) {
        <tr>
          <td><img [src]="product.image" [alt]="product.name"></td>
          <td>{{ product.name }}</td>
          <td>{{ product.sku }}</td>
          <td>{{ product.pricing.basePrice | number }} FCFA</td>
          <td [class.low-stock]="product.totalStock < 10">
            {{ product.totalStock }}
          </td>
          <td>
            <span [class]="'status-' + product.status">
              {{ product.status }}
            </span>
          </td>
          <td>
            <button (click)="edit(product.id)">Éditer</button>
            <button (click)="duplicate(product.id)">Dupliquer</button>
            <button (click)="delete(product.id)">Supprimer</button>
          </td>
        </tr>
      }
    </tbody>
  </table>
  
  <div class="pagination">
    <button (click)="previousPage()">Précédent</button>
    <span>Page {{ currentPage }} / {{ totalPages }}</span>
    <button (click)="nextPage()">Suivant</button>
  </div>
</div>
```

### 2. ProductFormComponent

**Fichier**: `src/app/pages/admin/products/product-form/product-form.component.ts`

**Fonctionnalités:**
- Formulaire réactif (ReactiveFormsModule)
- Upload d'images multiples
- Gestion des variantes (taille + couleur)
- Génération automatique de SKU
- Prévisualisation
- Validation en temps réel

**Structure du formulaire:**
```typescript
productForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', Validators.required],
  categoryId: [''],
  pricing: this.fb.group({
    basePrice: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [0],
    costPrice: [0]
  }),
  status: ['draft'],
  tags: [[]],
  variants: this.fb.array([]),
  media: this.fb.array([])
});
```

### 3. ProductDetailComponent

**Fichier**: `src/app/pages/admin/products/product-detail/product-detail.component.ts`

**Fonctionnalités:**
- Affichage détaillé du produit
- Gestion des variantes et stocks
- Historique des mouvements de stock
- Édition inline
- Export PDF

---

## 🛣️ Routes et navigation

### Routes admin produits

```typescript
{
  path: 'admin/products',
  loadComponent: () => import('./pages/admin/products/products-list/products-list.component'),
  canActivate: [authGuard]
},
{
  path: 'admin/products/new',
  loadComponent: () => import('./pages/admin/products/product-form/product-form.component'),
  canActivate: [authGuard]
},
{
  path: 'admin/products/:id',
  loadComponent: () => import('./pages/admin/products/product-detail/product-detail.component'),
  canActivate: [authGuard]
},
{
  path: 'admin/products/:id/edit',
  loadComponent: () => import('./pages/admin/products/product-form/product-form.component'),
  canActivate: [authGuard]
}
```

---

## ✅ Fonctionnalités implémentées

### ✅ CRUD Produits
- [x] Création de produit
- [x] Édition de produit
- [x] Suppression/archivage
- [x] Duplication de produit
- [x] Génération automatique de SKU
- [x] Génération automatique de slug

### ✅ Variantes et Stock
- [x] Gestion des variantes (taille + couleur)
- [x] Suivi des stocks par variante
- [x] Historique des mouvements de stock
- [x] Alertes stock bas (< 10 unités)
- [x] Multi-entrepôts (structure prête)

### ✅ Catégories
- [x] Création de catégories
- [x] Édition de catégories
- [x] Hiérarchie (parentId)
- [x] Organisation par ordre

### ✅ Recherche et Filtres
- [x] Recherche par nom/SKU
- [x] Filtres par catégorie, statut, prix
- [x] Filtres par stock (en stock, stock bas)
- [x] Tri par colonnes
- [x] Pagination

### ✅ Tags et Métadonnées
- [x] Système de tags
- [x] Métadonnées SEO
- [x] Auto-complétion (structure prête)

### ⏳ À implémenter (structure prête)
- [ ] Upload d'images (intégration Cloudinary/AWS S3)
- [ ] Éditeur WYSIWYG (TinyMCE)
- [ ] Promotions et coupons
- [ ] Rapports et analyses
- [ ] Export PDF/CSV
- [ ] Import de produits
- [ ] Drag-and-drop catégories

---

## 🚀 Commandes d'installation

### Installation des dépendances

```bash
# Aucune dépendance supplémentaire nécessaire
# Le projet utilise déjà Angular 17+ et RxJS
```

### Démarrage du projet

```bash
# Développement
npm run dev

# Build production
npm run build
```

### Migration vers une vraie API

Pour migrer vers un backend réel (Node.js/Express ou NestJS):

1. **Créer le backend:**
```bash
# Avec NestJS (recommandé)
npm install -g @nestjs/cli
nest new auradhom-api
cd auradhom-api
npm install @nestjs/typeorm typeorm pg  # PostgreSQL
# ou
npm install @nestjs/mongoose mongoose   # MongoDB
```

2. **Configurer l'API:**
```typescript
// Dans api.service.ts, remplacer les méthodes par:
createProduct(product: ExtendedProduct): Observable<ApiResponse<ExtendedProduct>> {
  return this.http.post<ApiResponse<ExtendedProduct>>(
    `${this.apiUrl}/products`,
    product
  );
}
```

3. **Configurer l'URL de l'API:**
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 🔐 Sécurité

### Authentification
- JWT tokens (structure prête)
- Guards Angular (authGuard)
- Rôles utilisateurs (admin, manager, etc.)

### Validation
- Validation côté client (ReactiveFormsModule)
- Validation côté serveur (à implémenter dans le backend)
- Sanitization des données

---

## 📈 Performance

### Optimisations
- Lazy loading des composants
- Pagination côté serveur
- Debounce sur la recherche
- Cache des données (Signals)
- Virtual scrolling (pour grandes listes)

### Bonnes pratiques
- OnPush change detection
- TrackBy functions dans les boucles
- Unsubscribe des observables
- Memoization des computed values

---

## 🧪 Tests

### Tests unitaires
```bash
npm run test
```

### Tests d'intégration
```bash
npm run test:e2e
```

---

## 📝 Prochaines étapes

1. **Implémenter les composants UI** (liste, formulaire, détails)
2. **Intégrer upload d'images** (Cloudinary ou AWS S3)
3. **Ajouter l'éditeur WYSIWYG** (TinyMCE ou Quill)
4. **Créer les rapports** (Chart.js)
5. **Migrer vers une vraie API** (NestJS + PostgreSQL)
6. **Ajouter les tests** (Jasmine/Karma)
7. **Optimiser les performances** (lazy loading, virtual scrolling)

---

## 📚 Documentation supplémentaire

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Date de création**: 2024
**Version**: 1.0.0
**Auteur**: AURADHOM Development Team


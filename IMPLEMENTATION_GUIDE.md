# Guide d'implémentation - Système de Gestion des Produits

## 📦 Fichiers créés

### 1. Modèles de données
- ✅ `src/app/models/product-extended.ts` - Modèles étendus (Product, Variant, Category, Stock, etc.)

### 2. Services
- ✅ `src/app/services/admin-product.service.ts` - Service de gestion des produits
- ✅ `src/app/services/api.service.ts` - Service API étendu (méthodes CRUD produits)

### 3. Routes
- ✅ `src/app/app.routes.ts` - Routes admin produits ajoutées

### 4. Documentation
- ✅ `ARCHITECTURE_PRODUITS.md` - Documentation complète de l'architecture
- ✅ `IMPLEMENTATION_GUIDE.md` - Ce fichier

---

## 🚀 Prochaines étapes pour compléter l'implémentation

### Étape 1: Créer les composants UI

#### 1.1 ProductsListComponent

**Créer**: `src/app/pages/admin/products/products-list/products-list.component.ts`

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../../../../services/admin-product.service';
import { ExtendedProduct, ProductFilters, ProductStatus } from '../../../../models/product-extended';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  private productService = inject(AdminProductService);
  private router = inject(Router);

  products = signal<ExtendedProduct[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  selectedStatus = signal<ProductStatus | ''>('');
  currentPage = signal(1);
  totalPages = signal(1);
  totalProducts = signal(0);

  filteredProducts = computed(() => {
    let filtered = this.products();
    const query = this.searchQuery().toLowerCase();
    
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
    }
    
    if (this.selectedStatus()) {
      filtered = filtered.filter(p => p.status === this.selectedStatus());
    }
    
    return filtered;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.loading.set(false);
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id, false).subscribe({
        next: () => {
          this.loadProducts();
        }
      });
    }
  }

  duplicateProduct(id: string): void {
    this.productService.duplicateProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      }
    });
  }

  getStatusClass(status: ProductStatus): string {
    const statusClasses: Record<ProductStatus, string> = {
      draft: 'status-draft',
      active: 'status-active',
      inactive: 'status-inactive',
      archived: 'status-archived'
    };
    return statusClasses[status] || '';
  }
}
```

**Template**: `products-list.component.html`

```html
<div class="products-list-container">
  <div class="header">
    <h1>Gestion des Produits</h1>
    <button class="btn-primary" [routerLink]="['/admin/products/new']">
      + Nouveau produit
    </button>
  </div>

  <div class="filters-bar">
    <input 
      type="text" 
      [(ngModel)]="searchQuery" 
      placeholder="Rechercher par nom ou SKU..."
      class="search-input"
    />
    <select [(ngModel)]="selectedCategory" class="filter-select">
      <option value="">Toutes les catégories</option>
      <!-- Options de catégories -->
    </select>
    <select [(ngModel)]="selectedStatus" class="filter-select">
      <option value="">Tous les statuts</option>
      <option value="draft">Brouillon</option>
      <option value="active">Actif</option>
      <option value="inactive">Inactif</option>
      <option value="archived">Archivé</option>
    </select>
  </div>

  @if (loading()) {
    <div class="loading">Chargement...</div>
  } @else {
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
        @for (product of filteredProducts(); track product.id) {
          <tr>
            <td>
              <img [src]="product.image || 'assets/placeholder.png'" [alt]="product.name" class="product-image">
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.sku }}</td>
            <td>{{ product.pricing?.basePrice | number }} FCFA</td>
            <td [class.low-stock]="product.totalStock < 10">
              {{ product.totalStock }}
            </td>
            <td>
              <span [class]="'status-badge ' + getStatusClass(product.status)">
                {{ product.status }}
              </span>
            </td>
            <td class="actions">
              <button [routerLink]="['/admin/products', product.id]">Voir</button>
              <button [routerLink]="['/admin/products', product.id, 'edit']">Éditer</button>
              <button (click)="duplicateProduct(product.id)">Dupliquer</button>
              <button (click)="deleteProduct(product.id)" class="btn-danger">Supprimer</button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  }
</div>
```

#### 1.2 ProductFormComponent

**Créer**: `src/app/pages/admin/products/product-form/product-form.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminProductService } from '../../../../services/admin-product.service';
import { ExtendedProduct, ProductStatus } from '../../../../models/product-extended';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(AdminProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    
    this.initForm();
    
    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      sku: ['', Validators.required],
      status: ['draft'],
      categoryId: [''],
      pricing: this.fb.group({
        basePrice: [0, [Validators.required, Validators.min(0)]],
        compareAtPrice: [0],
        costPrice: [0]
      }),
      type: ['T-shirt'],
      material: ['Coton lourd'],
      variants: this.fb.array([]),
      tags: this.fb.array([])
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            sku: product.sku,
            status: product.status,
            categoryId: product.categoryId,
            pricing: product.pricing,
            type: product.type,
            material: product.material
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const productData = this.productForm.value;
      
      // Générer le slug automatiquement
      productData.slug = this.productService.generateSlug(productData.name);
      
      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, productData).subscribe({
          next: () => {
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.loading = false;
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.loading = false;
          }
        });
      }
    }
  }

  generateSKU(): void {
    const name = this.productForm.get('name')?.value || '';
    if (name) {
      const sku = this.productService.generateSKU(name);
      this.productForm.patchValue({ sku });
    }
  }
}
```

---

## 🎨 Styles CSS

**Créer**: `src/app/pages/admin/products/products-list/products-list.component.css`

```css
.products-list-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--gray-dark);
  background: transparent;
  color: var(--text-primary);
}

.filter-select {
  padding: 10px;
  border: 1px solid var(--gray-dark);
  background: transparent;
  color: var(--text-primary);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--gray-dark);
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  background: #28a745;
  color: white;
}

.status-draft {
  background: #ffc107;
  color: black;
}

.status-inactive {
  background: #6c757d;
  color: white;
}

.status-archived {
  background: #dc3545;
  color: white;
}

.low-stock {
  color: #dc3545;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  cursor: pointer;
}

.btn-danger {
  padding: 5px 10px;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
}
```

---

## 🔗 Intégration dans le Dashboard

**Modifier**: `src/app/pages/admin/dashboard/admin-dashboard.component.html`

Ajouter un onglet "Produits":

```html
<button
  [class.active]="activeTab() === 'products'"
  (click)="setActiveTab('products')"
  class="nav-button"
>
  Produits
</button>
```

Et dans le template:

```html
@else if (activeTab() === 'products') {
  <app-products-list></app-products-list>
}
```

---

## ✅ Checklist d'implémentation

### Phase 1: Base (✅ Complété)
- [x] Modèles de données étendus
- [x] Service API (CRUD complet)
- [x] Service AdminProductService
- [x] Routes admin produits

### Phase 2: Composants UI (À implémenter)
- [ ] ProductsListComponent
- [ ] ProductFormComponent
- [ ] ProductDetailComponent
- [ ] ProductFiltersComponent

### Phase 3: Fonctionnalités avancées (À implémenter)
- [ ] Gestion des variantes (formulaire)
- [ ] Upload d'images
- [ ] Gestion des stocks
- [ ] Historique des mouvements
- [ ] Recherche et filtres avancés
- [ ] Export/Import

### Phase 4: Intégrations (À implémenter)
- [ ] Cloudinary/AWS S3 pour images
- [ ] Éditeur WYSIWYG
- [ ] Chart.js pour statistiques
- [ ] Export PDF

---

## 📝 Notes importantes

1. **LocalStorage**: Actuellement, les données sont stockées dans localStorage. Pour la production, migrer vers une vraie API (NestJS + PostgreSQL).

2. **Upload d'images**: Pour l'instant, utiliser des URLs d'images. Intégrer Cloudinary ou AWS S3 pour l'upload réel.

3. **Validation**: La validation est actuellement côté client. Ajouter la validation côté serveur dans le backend.

4. **Performance**: Pour de grandes listes, implémenter la pagination côté serveur et le virtual scrolling.

5. **Sécurité**: Ajouter l'authentification JWT et la validation des rôles côté serveur.

---

## 🚀 Commandes pour démarrer

```bash
# 1. Créer les composants
ng generate component pages/admin/products/products-list --standalone
ng generate component pages/admin/products/product-form --standalone
ng generate component pages/admin/products/product-detail --standalone

# 2. Installer les dépendances (si nécessaire)
npm install

# 3. Démarrer le serveur de développement
npm run dev

# 4. Accéder à l'admin
# http://localhost:4200/admin/products
```

---

**Prochaines étapes**: Implémenter les composants UI en suivant les exemples ci-dessus, puis ajouter les fonctionnalités avancées une par une.


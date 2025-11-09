import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../../../../services/admin-product.service';
import { ExtendedProduct, ProductStatus } from '../../../../models/product-extended';

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

  filteredProducts = computed(() => {
    let filtered = this.products();
    const query = this.searchQuery().toLowerCase();
    
    if (query) {
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
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
        this.products.set([]);
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id, false).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  duplicateProduct(id: string): void {
    this.productService.duplicateProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
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

  getStatusLabel(status: ProductStatus): string {
    const labels: Record<ProductStatus, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      inactive: 'Inactif',
      archived: 'Archivé'
    };
    return labels[status] || status;
  }
}


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminProductService } from '../../../../services/admin-product.service';
import { ExtendedProduct } from '../../../../models/product-extended';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(AdminProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product: ExtendedProduct | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.errorMessage = 'Produit non trouvé';
        this.loading = false;
      }
    });
  }

  deleteProduct(): void {
    if (this.product && confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      // Convertir l'ID en string pour assurer la compatibilité
      const productId = String(this.product.id);
      this.productService.deleteProduct(productId, false).subscribe({
        next: () => {
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression';
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      inactive: 'Inactif',
      archived: 'Archivé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'status-draft',
      active: 'status-active',
      inactive: 'status-inactive',
      archived: 'status-archived'
    };
    return classes[status] || '';
  }
}


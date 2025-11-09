import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId && this.productId !== 'new';
    
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
      material: ['Coton lourd']
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            name: product.name,
            description: product.description || '',
            sku: product.sku,
            status: product.status,
            categoryId: product.categoryId || '',
            pricing: product.pricing || { basePrice: 0, currency: 'FCFA' },
            type: product.type || 'T-shirt',
            material: product.material || 'Coton lourd'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.errorMessage = 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const productData = {
        ...this.productForm.value,
        slug: this.productService.generateSlug(this.productForm.value.name),
        variants: [],
        media: [],
        tags: [],
        totalStock: 0
      };
      
      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, productData).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Produit mis à jour avec succès';
              setTimeout(() => {
                this.router.navigate(['/admin/products']);
              }, 1500);
            } else {
              this.errorMessage = response.error || 'Erreur lors de la mise à jour';
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.errorMessage = 'Erreur lors de la mise à jour du produit';
            this.loading = false;
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Produit créé avec succès';
              setTimeout(() => {
                this.router.navigate(['/admin/products']);
              }, 1500);
            } else {
              this.errorMessage = response.error || 'Erreur lors de la création';
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.errorMessage = 'Erreur lors de la création du produit';
            this.loading = false;
          }
        });
      }
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  generateSKU(): void {
    const name = this.productForm.get('name')?.value || '';
    if (name) {
      const sku = this.productService.generateSKU(name);
      this.productForm.patchValue({ sku });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}


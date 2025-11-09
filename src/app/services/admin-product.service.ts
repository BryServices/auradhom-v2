import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtendedProduct, ProductFilters, PaginatedProducts, ProductStatus, ProductVariant, Category, ProductTag, StockMovement, Warehouse, Promotion, ProductStats } from '../models/product-extended';
import { ApiService, ApiResponse } from './api.service';

/**
 * Service de gestion des produits pour l'administration
 */
@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiService = inject(ApiService);
  
  private products = signal<ExtendedProduct[]>([]);
  private categories = signal<Category[]>([]);
  private tags = signal<ProductTag[]>([]);
  private warehouses = signal<Warehouse[]>([]);
  private promotions = signal<Promotion[]>([]);

  // Computed signals
  activeProducts = computed(() => 
    this.products().filter(p => p.status === ProductStatus.ACTIVE)
  );
  
  lowStockProducts = computed(() =>
    this.products().filter(p => p.totalStock > 0 && p.totalStock < 10)
  );

  outOfStockProducts = computed(() =>
    this.products().filter(p => p.totalStock === 0)
  );

  constructor() {
    this.loadInitialData();
  }

  /**
   * Charger les données initiales
   */
  private loadInitialData(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadTags();
    this.loadWarehouses();
    this.loadPromotions();
  }

  // ==================== PRODUITS ====================

  /**
   * Charger tous les produits
   */
  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  /**
   * Obtenir tous les produits
   */
  getProducts(): Observable<ExtendedProduct[]> {
    return this.apiService.getProducts().pipe(
      delay(0),
      map(response => response.data || [])
    );
  }

  /**
   * Obtenir un produit par ID
   */
  getProductById(id: string): Observable<ExtendedProduct | null> {
    return this.apiService.getProduct(id).pipe(
      map(response => response.data || null)
    );
  }

  /**
   * Rechercher et filtrer les produits
   */
  searchProducts(filters: ProductFilters): Observable<PaginatedProducts> {
    return this.apiService.searchProducts(filters).pipe(
      map(response => response.data || { products: [], total: 0, page: 1, limit: 20, totalPages: 0 })
    );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(product: Partial<ExtendedProduct>): Observable<ApiResponse<ExtendedProduct>> {
    return this.apiService.createProduct(product).pipe(
      delay(300)
    );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: string, product: Partial<ExtendedProduct>): Observable<ApiResponse<ExtendedProduct>> {
    return this.apiService.updateProduct(id, product).pipe(
      delay(300)
    );
  }

  /**
   * Dupliquer un produit
   */
  duplicateProduct(id: string): Observable<ApiResponse<ExtendedProduct>> {
    return this.apiService.duplicateProduct(id).pipe(
      delay(300)
    );
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(id: string, permanent: boolean = false): Observable<ApiResponse<void>> {
    return this.apiService.deleteProduct(id, permanent).pipe(
      delay(300)
    );
  }

  /**
   * Changer le statut d'un produit
   */
  updateProductStatus(id: string, status: ProductStatus): Observable<ApiResponse<ExtendedProduct>> {
    return this.apiService.updateProductStatus(id, status).pipe(
      delay(300)
    );
  }

  /**
   * Générer un SKU unique
   */
  generateSKU(productName: string, variant?: { size?: string; color?: string }): string {
    const prefix = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const size = variant?.size ? variant.size : '';
    const color = variant?.color ? variant.color.name.substring(0, 2).toUpperCase() : '';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${size}${color}-${timestamp}`;
  }

  /**
   * Générer un slug à partir d'un nom
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // ==================== VARIANTES ====================

  /**
   * Ajouter une variante à un produit
   */
  addVariant(productId: string, variant: Partial<ProductVariant>): Observable<ApiResponse<ProductVariant>> {
    return this.apiService.addProductVariant(productId, variant).pipe(
      delay(300)
    );
  }

  /**
   * Mettre à jour une variante
   */
  updateVariant(productId: string, variantId: string, variant: Partial<ProductVariant>): Observable<ApiResponse<ProductVariant>> {
    return this.apiService.updateProductVariant(productId, variantId, variant).pipe(
      delay(300)
    );
  }

  /**
   * Supprimer une variante
   */
  deleteVariant(productId: string, variantId: string): Observable<ApiResponse<void>> {
    return this.apiService.deleteProductVariant(productId, variantId).pipe(
      delay(300)
    );
  }

  // ==================== CATÉGORIES ====================

  /**
   * Charger les catégories
   */
  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        }
      }
    });
  }

  /**
   * Obtenir toutes les catégories
   */
  getCategories(): Observable<Category[]> {
    return this.apiService.getCategories().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Créer une catégorie
   */
  createCategory(category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.apiService.createCategory(category).pipe(
      delay(300)
    );
  }

  /**
   * Mettre à jour une catégorie
   */
  updateCategory(id: string, category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.apiService.updateCategory(id, category).pipe(
      delay(300)
    );
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.apiService.deleteCategory(id).pipe(
      delay(300)
    );
  }

  // ==================== TAGS ====================

  /**
   * Charger les tags
   */
  loadTags(): void {
    this.apiService.getTags().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tags.set(response.data);
        }
      }
    });
  }

  /**
   * Obtenir tous les tags
   */
  getTags(): Observable<ProductTag[]> {
    return this.apiService.getTags().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Créer un tag
   */
  createTag(tag: Partial<ProductTag>): Observable<ApiResponse<ProductTag>> {
    return this.apiService.createTag(tag).pipe(
      delay(300)
    );
  }

  // ==================== STOCK ====================

  /**
   * Mettre à jour le stock d'une variante
   */
  updateStock(variantId: string, quantity: number, reason?: string, warehouseId?: string): Observable<ApiResponse<StockMovement>> {
    return this.apiService.updateStock(variantId, quantity, reason, warehouseId).pipe(
      delay(300)
    );
  }

  /**
   * Obtenir l'historique des mouvements de stock
   */
  getStockHistory(variantId: string): Observable<StockMovement[]> {
    return this.apiService.getStockHistory(variantId).pipe(
      map(response => response.data || [])
    );
  }

  // ==================== ENTREPÔTS ====================

  /**
   * Charger les entrepôts
   */
  loadWarehouses(): void {
    this.apiService.getWarehouses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouses.set(response.data);
        }
      }
    });
  }

  /**
   * Obtenir tous les entrepôts
   */
  getWarehouses(): Observable<Warehouse[]> {
    return this.apiService.getWarehouses().pipe(
      map(response => response.data || [])
    );
  }

  // ==================== PROMOTIONS ====================

  /**
   * Charger les promotions
   */
  loadPromotions(): void {
    this.apiService.getPromotions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.promotions.set(response.data);
        }
      }
    });
  }

  /**
   * Obtenir toutes les promotions
   */
  getPromotions(): Observable<Promotion[]> {
    return this.apiService.getPromotions().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Créer une promotion
   */
  createPromotion(promotion: Partial<Promotion>): Observable<ApiResponse<Promotion>> {
    return this.apiService.createPromotion(promotion).pipe(
      delay(300)
    );
  }

  // ==================== STATISTIQUES ====================

  /**
   * Obtenir les statistiques des produits
   */
  getProductStats(): Observable<ProductStats> {
    return this.apiService.getProductStats().pipe(
      map(response => response.data || {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalStockValue: 0,
        categoriesCount: 0,
        averagePrice: 0
      })
    );
  }

  // ==================== EXPORT ====================

  /**
   * Exporter les produits
   */
  exportProducts(filters?: ProductFilters): Observable<Blob> {
    return this.apiService.exportProducts(filters);
  }

  /**
   * Importer des produits depuis un fichier
   */
  importProducts(file: File): Observable<ApiResponse<{ imported: number; errors: string[] }>> {
    return this.apiService.importProducts(file);
  }
}


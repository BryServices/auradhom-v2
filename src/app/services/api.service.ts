import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

/**
 * Service API pour gérer les données de la base de données
 * 
 * Ce service simule des appels API et peut être facilement remplacé
 * par de vrais appels HTTP vers un backend.
 * 
 * Pour utiliser une vraie API :
 * 1. Remplacer les méthodes par des appels HttpClient
 * 2. Configurer l'URL de l'API dans environment.ts
 * 3. Adapter les interfaces de réponse si nécessaire
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_DELAY = 300; // Simuler la latence réseau (ms)
  
  // Simuler une base de données en mémoire (remplacé par IndexedDB ou vraie API)
  private db: Map<string, any> = new Map();

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialiser la base de données depuis localStorage
   * (Migration depuis localStorage vers la structure API)
   */
  private initializeDatabase(): void {
    // Migrer les données existantes depuis localStorage
    this.migrateFromLocalStorage();
  }

  /**
   * Migrer les données depuis localStorage
   */
  private migrateFromLocalStorage(): void {
    // Migrer les commandes
    const pendingOrders = this.getFromStorage('auradhom_pending_orders', []);
    const validatedOrders = this.getFromStorage('auradhom_validated_orders', []);
    const rejectedOrders = this.getFromStorage('auradhom_rejected_orders', []);
    
    if (pendingOrders.length > 0) {
      this.db.set('pending_orders', pendingOrders);
    }
    if (validatedOrders.length > 0) {
      this.db.set('validated_orders', validatedOrders);
    }
    if (rejectedOrders.length > 0) {
      this.db.set('rejected_orders', rejectedOrders);
    }

    // Migrer la configuration ou créer la config par défaut
    const config = this.getFromStorage('auradhom_app_config', null);
    if (config) {
      this.db.set('app_config', config);
    } else {
      // Créer la config par défaut
      const defaultConfig = {
        admin: {
          email: 'ProdigeKoumba@admin.com',
          password: 'KP_PRO2026@Admin'
        },
        whatsappPhone: '242050728339'
      };
      this.db.set('app_config', defaultConfig);
      this.saveToStorage('auradhom_app_config', defaultConfig);
    }

    // Migrer les utilisateurs admin
    const adminAuth = this.getFromStorage('auradhom_admin_auth', null);
    if (adminAuth) {
      this.db.set('admin_auth', adminAuth);
    }

    // Migrer les produits existants
    const existingProducts = this.getFromStorage('auradhom_products', []);
    if (existingProducts.length === 0) {
      // Créer des produits par défaut depuis le ProductService
      this.initializeDefaultProducts();
    } else {
      this.db.set('products', existingProducts);
    }

    // Initialiser les catégories par défaut
    const existingCategories = this.getFromStorage('auradhom_categories', []);
    if (existingCategories.length === 0) {
      this.initializeDefaultCategories();
    } else {
      this.db.set('categories', existingCategories);
    }

    // Initialiser les tags par défaut
    const existingTags = this.getFromStorage('auradhom_tags', []);
    if (existingTags.length === 0) {
      this.initializeDefaultTags();
    } else {
      this.db.set('tags', existingTags);
    }
  }

  /**
   * Initialiser les produits par défaut
   */
  private initializeDefaultProducts(): void {
    const defaultProducts = [
      {
        id: 'prod_1',
        name: 'T-shirt Blanc',
        slug: 't-shirt-blanc',
        sku: 'TSH-BLANC-001',
        status: 'active',
        price: 12500,
        pricing: {
          basePrice: 12500,
          currency: 'FCFA'
        },
        description: 'Coton 180 g/m². Coupe droite. Essentiel.',
        image: 'assets/blanc.png',
        gallery: ['assets/blanc.png'],
        details: {
          composition: '100% Coton',
          maintenance: 'Lavage à 30°.',
          origin: 'Sénégal'
        },
        type: 'T-shirt',
        material: 'Coton lourd',
        variants: [
          {
            id: 'var_1_1',
            productId: 'prod_1',
            size: 'S',
            color: { name: 'Blanc', hex: '#FFFFFF' },
            sku: 'TSH-BLANC-S',
            stock: 10,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'var_1_2',
            productId: 'prod_1',
            size: 'M',
            color: { name: 'Blanc', hex: '#FFFFFF' },
            sku: 'TSH-BLANC-M',
            stock: 15,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        media: [
          {
            id: 'media_1',
            productId: 'prod_1',
            type: 'image',
            url: 'assets/blanc.png',
            order: 0,
            isPrimary: true,
            createdAt: new Date()
          }
        ],
        totalStock: 25,
        categoryId: 'cat_tshirt',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.db.set('products', defaultProducts);
    this.saveToStorage('auradhom_products', defaultProducts);
  }

  /**
   * Initialiser les catégories par défaut
   */
  private initializeDefaultCategories(): void {
    const defaultCategories = [
      {
        id: 'cat_tshirt',
        name: 'T-shirts',
        slug: 't-shirts',
        description: 'Collection de t-shirts',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat_hoodie',
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Collection de hoodies',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.db.set('categories', defaultCategories);
    this.saveToStorage('auradhom_categories', defaultCategories);
  }

  /**
   * Initialiser les tags par défaut
   */
  private initializeDefaultTags(): void {
    const defaultTags = [
      {
        id: 'tag_new',
        name: 'Nouveau',
        slug: 'nouveau',
        color: '#28a745'
      },
      {
        id: 'tag_sale',
        name: 'Promotion',
        slug: 'promotion',
        color: '#dc3545'
      },
      {
        id: 'tag_bestseller',
        name: 'Best-seller',
        slug: 'bestseller',
        color: '#ffc107'
      }
    ];

    this.db.set('tags', defaultTags);
    this.saveToStorage('auradhom_tags', defaultTags);
  }

  /**
   * Lire depuis localStorage (pour migration)
   */
  private getFromStorage(key: string, defaultValue: any): any {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Sauvegarder dans localStorage (simulation de persistance)
   */
  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}`, error);
    }
  }

  // ==================== ORDERS ====================

  /**
   * Récupérer toutes les commandes en attente
   */
  getPendingOrders(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('pending_orders') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer toutes les commandes validées
   */
  getValidatedOrders(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('validated_orders') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer toutes les commandes rejetées
   */
  getRejectedOrders(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('rejected_orders') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Créer une nouvelle commande en attente
   * IMPORTANT: La commande est IMMÉDIATEMENT sauvegardée dans la base de données
   */
  createPendingOrder(order: any): Observable<ApiResponse<any>> {
    // Récupérer les commandes existantes depuis la BD
    const orders = this.db.get('pending_orders') || [];
    
    // Vérifier si la commande existe déjà (éviter les doublons)
    const existingOrder = orders.find((o: any) => o.id === order.id || o.orderId === order.orderId);
    if (existingOrder) {
      return of({
        success: false,
        error: 'Cette commande existe déjà',
        data: existingOrder
      }).pipe(delay(this.API_DELAY));
    }
    
    // Ajouter la nouvelle commande
    orders.push(order);
    
    // SAUVEGARDER DANS LA BASE DE DONNÉES (localStorage qui simule la BD)
    this.db.set('pending_orders', orders);
    this.saveToStorage('auradhom_pending_orders', orders);
    
    console.log('✅ Commande sauvegardée dans la BD:', order.orderId);
    console.log('📊 Total de commandes en attente:', orders.length);
    
    return of({
      success: true,
      data: order,
      message: 'Commande créée et sauvegardée avec succès dans la base de données'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Valider une commande
   */
  validateOrder(orderId: string, validatedOrder: any): Observable<ApiResponse<any>> {
    // Retirer de pending
    const pendingOrders = (this.db.get('pending_orders') || []).filter((o: any) => o.id !== orderId);
    this.db.set('pending_orders', pendingOrders);
    this.saveToStorage('auradhom_pending_orders', pendingOrders);

    // Ajouter à validated
    const validatedOrders = this.db.get('validated_orders') || [];
    validatedOrders.push(validatedOrder);
    this.db.set('validated_orders', validatedOrders);
    this.saveToStorage('auradhom_validated_orders', validatedOrders);

    return of({
      success: true,
      data: validatedOrder,
      message: 'Commande validée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Rejeter une commande
   */
  rejectOrder(orderId: string, rejectedOrder: any): Observable<ApiResponse<any>> {
    // Retirer de pending
    const pendingOrders = (this.db.get('pending_orders') || []).filter((o: any) => o.id !== orderId);
    this.db.set('pending_orders', pendingOrders);
    this.saveToStorage('auradhom_pending_orders', pendingOrders);

    // Ajouter à rejected
    const rejectedOrders = this.db.get('rejected_orders') || [];
    rejectedOrders.push(rejectedOrder);
    this.db.set('rejected_orders', rejectedOrders);
    this.saveToStorage('auradhom_rejected_orders', rejectedOrders);

    return of({
      success: true,
      data: rejectedOrder,
      message: 'Commande rejetée'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour les commandes (pour synchronisation)
   */
  updateOrders(pending: any[], validated: any[], rejected: any[]): Observable<ApiResponse<void>> {
    this.db.set('pending_orders', pending);
    this.db.set('validated_orders', validated);
    this.db.set('rejected_orders', rejected);
    
    this.saveToStorage('auradhom_pending_orders', pending);
    this.saveToStorage('auradhom_validated_orders', validated);
    this.saveToStorage('auradhom_rejected_orders', rejected);

    return of({
      success: true,
      message: 'Commandes mises à jour'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== AUTH ====================

  /**
   * Authentifier un administrateur
   */
  login(email: string, password: string): Observable<ApiResponse<any>> {
    // Charger la config depuis localStorage directement pour éviter la dépendance circulaire
    let config = this.db.get('app_config');
    if (!config) {
      try {
        const stored = localStorage.getItem('auradhom_app_config');
        if (stored) {
          config = JSON.parse(stored);
          this.db.set('app_config', config);
        }
      } catch {
        // Utiliser la config par défaut si erreur
        config = {
          admin: {
            email: 'ProdigeKoumba@admin.com',
            password: 'KP_PRO2026@Admin'
          },
          whatsappPhone: '242050728339'
        };
      }
    }

    if (!config || config.admin.email !== email || config.admin.password !== password) {
      return of({
        success: false,
        error: 'Identifiants invalides'
      }).pipe(delay(this.API_DELAY));
    }

    const user = {
      id: '1',
      email: email,
      name: 'Administrateur'
    };

    this.db.set('admin_auth', user);
    this.saveToStorage('auradhom_admin_auth', user);

    return of({
      success: true,
      data: user,
      message: 'Connexion réussie'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Déconnexion
   */
  logout(): Observable<ApiResponse<void>> {
    this.db.delete('admin_auth');
    localStorage.removeItem('auradhom_admin_auth');

    return of({
      success: true,
      message: 'Déconnexion réussie'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser(): Observable<ApiResponse<any>> {
    const user = this.db.get('admin_auth') || this.getFromStorage('auradhom_admin_auth', null);
    return of({
      success: true,
      data: user
    }).pipe(delay(0));
  }

  // ==================== CONFIG ====================

  /**
   * Récupérer la configuration
   */
  getConfig(): Observable<ApiResponse<any>> {
    const config = this.db.get('app_config') || this.getFromStorage('auradhom_app_config', null);
    return of({
      success: true,
      data: config
    }).pipe(delay(0));
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(config: any): Observable<ApiResponse<any>> {
    this.db.set('app_config', config);
    this.saveToStorage('auradhom_app_config', config);

    return of({
      success: true,
      data: config,
      message: 'Configuration mise à jour'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour les identifiants admin
   */
  updateAdminCredentials(email: string, password: string): Observable<ApiResponse<void>> {
    const config = this.db.get('app_config') || this.getFromStorage('auradhom_app_config', null);
    if (!config) {
      return of({
        success: false,
        error: 'Configuration non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    config.admin.email = email;
    config.admin.password = password;

    this.db.set('app_config', config);
    this.saveToStorage('auradhom_app_config', config);

    return of({
      success: true,
      message: 'Identifiants mis à jour'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour le numéro WhatsApp
   */
  updateWhatsAppPhone(phone: string): Observable<ApiResponse<void>> {
    const config = this.db.get('app_config') || this.getFromStorage('auradhom_app_config', null);
    if (!config) {
      return of({
        success: false,
        error: 'Configuration non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    config.whatsappPhone = phone;

    this.db.set('app_config', config);
    this.saveToStorage('auradhom_app_config', config);

    return of({
      success: true,
      message: 'Numéro WhatsApp mis à jour'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== PRODUCTS ====================

  /**
   * Récupérer tous les produits
   */
  getProducts(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('products') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer un produit par ID
   */
  getProduct(id: string): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const product = products.find((p: any) => p.id === id);
    return of({
      success: !!product,
      data: product || null,
      error: product ? undefined : 'Produit non trouvé'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Rechercher et filtrer les produits
   */
  searchProducts(filters: any): Observable<ApiResponse<any>> {
    let products = this.db.get('products') || [];
    
    // Appliquer les filtres
    if (filters.search) {
      const search = filters.search.toLowerCase();
      products = products.filter((p: any) => 
        p.name.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    
    if (filters.categoryId) {
      products = products.filter((p: any) => p.categoryId === filters.categoryId);
    }
    
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      products = products.filter((p: any) => statuses.includes(p.status));
    }
    
    if (filters.minPrice !== undefined) {
      products = products.filter((p: any) => p.pricing && p.pricing.basePrice >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      products = products.filter((p: any) => p.pricing && p.pricing.basePrice <= filters.maxPrice);
    }
    
    if (filters.inStock) {
      products = products.filter((p: any) => p.totalStock > 0);
    }
    
    if (filters.lowStock) {
      products = products.filter((p: any) => p.totalStock > 0 && p.totalStock < 10);
    }

    // Tri
    if (filters.sortBy) {
      products.sort((a: any, b: any) => {
        const aVal = a[filters.sortBy] || 0;
        const bVal = b[filters.sortBy] || 0;
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return (aVal > bVal ? 1 : -1) * order;
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = products.slice(start, end);

    return of({
      success: true,
      data: {
        products: paginatedProducts,
        total: products.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(products.length / limit)
      }
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(product: any): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const newProduct = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: product.variants || [],
      media: product.media || [],
      totalStock: 0
    };
    
    products.push(newProduct);
    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      data: newProduct,
      message: 'Produit créé avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: string, product: any): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const index = products.findIndex((p: any) => p.id === id);
    
    if (index === -1) {
      return of({
        success: false,
        error: 'Produit non trouvé'
      }).pipe(delay(this.API_DELAY));
    }

    products[index] = {
      ...products[index],
      ...product,
      id: products[index].id, // Garder l'ID original
      updatedAt: new Date()
    };

    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      data: products[index],
      message: 'Produit mis à jour avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Dupliquer un produit
   */
  duplicateProduct(id: string): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const product = products.find((p: any) => p.id === id);
    
    if (!product) {
      return of({
        success: false,
        error: 'Produit non trouvé'
      }).pipe(delay(this.API_DELAY));
    }

    const duplicated = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${product.name} (Copie)`,
      sku: `${product.sku}-COPY`,
      slug: `${product.slug}-copy`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: product.variants?.map((v: any) => ({
        ...v,
        id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stock: 0
      })) || []
    };

    products.push(duplicated);
    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      data: duplicated,
      message: 'Produit dupliqué avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(id: string, permanent: boolean = false): Observable<ApiResponse<void>> {
    const products = this.db.get('products') || [];
    
    if (permanent) {
      const filtered = products.filter((p: any) => p.id !== id);
      this.db.set('products', filtered);
      this.saveToStorage('auradhom_products', filtered);
    } else {
      // Archiver
      const index = products.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        products[index].status = 'archived';
        products[index].updatedAt = new Date();
        this.db.set('products', products);
        this.saveToStorage('auradhom_products', products);
      }
    }

    return of({
      success: true,
      message: permanent ? 'Produit supprimé définitivement' : 'Produit archivé'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour le statut d'un produit
   */
  updateProductStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return this.updateProduct(id, { status, updatedAt: new Date() });
  }

  /**
   * Ajouter une variante à un produit
   */
  addProductVariant(productId: string, variant: any): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const product = products.find((p: any) => p.id === productId);
    
    if (!product) {
      return of({
        success: false,
        error: 'Produit non trouvé'
      }).pipe(delay(this.API_DELAY));
    }

    const newVariant = {
      ...variant,
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: productId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    product.variants = product.variants || [];
    product.variants.push(newVariant);
    product.totalStock = (product.totalStock || 0) + (newVariant.stock || 0);
    product.updatedAt = new Date();

    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      data: newVariant,
      message: 'Variante ajoutée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour une variante
   */
  updateProductVariant(productId: string, variantId: string, variant: any): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const product = products.find((p: any) => p.id === productId);
    
    if (!product) {
      return of({
        success: false,
        error: 'Produit non trouvé'
      }).pipe(delay(this.API_DELAY));
    }

    const variantIndex = product.variants?.findIndex((v: any) => v.id === variantId);
    if (variantIndex === -1 || variantIndex === undefined) {
      return of({
        success: false,
        error: 'Variante non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    const oldStock = product.variants[variantIndex].stock || 0;
    product.variants[variantIndex] = {
      ...product.variants[variantIndex],
      ...variant,
      updatedAt: new Date()
    };
    const newStock = product.variants[variantIndex].stock || 0;
    
    product.totalStock = (product.totalStock || 0) - oldStock + newStock;
    product.updatedAt = new Date();

    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      data: product.variants[variantIndex],
      message: 'Variante mise à jour avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Supprimer une variante
   */
  deleteProductVariant(productId: string, variantId: string): Observable<ApiResponse<void>> {
    const products = this.db.get('products') || [];
    const product = products.find((p: any) => p.id === productId);
    
    if (!product) {
      return of({
        success: false,
        error: 'Produit non trouvé'
      }).pipe(delay(this.API_DELAY));
    }

    const variantIndex = product.variants?.findIndex((v: any) => v.id === variantId);
    if (variantIndex === -1 || variantIndex === undefined) {
      return of({
        success: false,
        error: 'Variante non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    const removedStock = product.variants[variantIndex].stock || 0;
    product.variants.splice(variantIndex, 1);
    product.totalStock = Math.max(0, (product.totalStock || 0) - removedStock);
    product.updatedAt = new Date();

    this.db.set('products', products);
    this.saveToStorage('auradhom_products', products);

    return of({
      success: true,
      message: 'Variante supprimée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== CATEGORIES ====================

  /**
   * Récupérer toutes les catégories
   */
  getCategories(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('categories') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Créer une catégorie
   */
  createCategory(category: any): Observable<ApiResponse<any>> {
    const categories = this.db.get('categories') || [];
    const newCategory = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categories.push(newCategory);
    this.db.set('categories', categories);
    this.saveToStorage('auradhom_categories', categories);

    return of({
      success: true,
      data: newCategory,
      message: 'Catégorie créée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Mettre à jour une catégorie
   */
  updateCategory(id: string, category: any): Observable<ApiResponse<any>> {
    const categories = this.db.get('categories') || [];
    const index = categories.findIndex((c: any) => c.id === id);
    
    if (index === -1) {
      return of({
        success: false,
        error: 'Catégorie non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    categories[index] = {
      ...categories[index],
      ...category,
      id: categories[index].id,
      updatedAt: new Date()
    };

    this.db.set('categories', categories);
    this.saveToStorage('auradhom_categories', categories);

    return of({
      success: true,
      data: categories[index],
      message: 'Catégorie mise à jour avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategory(id: string): Observable<ApiResponse<void>> {
    const categories = this.db.get('categories') || [];
    const filtered = categories.filter((c: any) => c.id !== id);
    this.db.set('categories', filtered);
    this.saveToStorage('auradhom_categories', filtered);

    return of({
      success: true,
      message: 'Catégorie supprimée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== TAGS ====================

  /**
   * Récupérer tous les tags
   */
  getTags(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('tags') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Créer un tag
   */
  createTag(tag: any): Observable<ApiResponse<any>> {
    const tags = this.db.get('tags') || [];
    const newTag = {
      ...tag,
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')
    };
    
    tags.push(newTag);
    this.db.set('tags', tags);
    this.saveToStorage('auradhom_tags', tags);

    return of({
      success: true,
      data: newTag,
      message: 'Tag créé avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== STOCK ====================

  /**
   * Mettre à jour le stock
   */
  updateStock(variantId: string, quantity: number, reason?: string, warehouseId?: string): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    let variant: any = null;
    let product: any = null;

    // Trouver la variante
    for (const p of products) {
      const v = p.variants?.find((vv: any) => vv.id === variantId);
      if (v) {
        variant = v;
        product = p;
        break;
      }
    }

    if (!variant || !product) {
      return of({
        success: false,
        error: 'Variante non trouvée'
      }).pipe(delay(this.API_DELAY));
    }

    const previousStock = variant.stock || 0;
    variant.stock = quantity;
    variant.updatedAt = new Date();

    // Recalculer le stock total du produit
    product.totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
    product.updatedAt = new Date();

    // Enregistrer le mouvement
    const movements = this.db.get('stock_movements') || [];
    const movement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      variantId: variantId,
      type: quantity > previousStock ? 'in' : 'out',
      quantity: Math.abs(quantity - previousStock),
      previousStock: previousStock,
      newStock: quantity,
      reason: reason,
      warehouseId: warehouseId,
      performedBy: 'admin', // À remplacer par l'utilisateur connecté
      createdAt: new Date()
    };
    movements.push(movement);

    this.db.set('products', products);
    this.db.set('stock_movements', movements);
    this.saveToStorage('auradhom_products', products);
    this.saveToStorage('auradhom_stock_movements', movements);

    return of({
      success: true,
      data: movement,
      message: 'Stock mis à jour avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Obtenir l'historique des mouvements de stock
   */
  getStockHistory(variantId: string): Observable<ApiResponse<any[]>> {
    const movements = this.db.get('stock_movements') || [];
    const history = movements.filter((m: any) => m.variantId === variantId);
    
    return of({
      success: true,
      data: history
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== WAREHOUSES ====================

  /**
   * Récupérer tous les entrepôts
   */
  getWarehouses(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('warehouses') || []
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== PROMOTIONS ====================

  /**
   * Récupérer toutes les promotions
   */
  getPromotions(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.db.get('promotions') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Créer une promotion
   */
  createPromotion(promotion: any): Observable<ApiResponse<any>> {
    const promotions = this.db.get('promotions') || [];
    const newPromotion = {
      ...promotion,
      id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    promotions.push(newPromotion);
    this.db.set('promotions', promotions);
    this.saveToStorage('auradhom_promotions', promotions);

    return of({
      success: true,
      data: newPromotion,
      message: 'Promotion créée avec succès'
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== STATISTIQUES ====================

  /**
   * Obtenir les statistiques des produits
   */
  getProductStats(): Observable<ApiResponse<any>> {
    const products = this.db.get('products') || [];
    const activeProducts = products.filter((p: any) => p.status === 'active');
    const lowStockProducts = products.filter((p: any) => p.totalStock > 0 && p.totalStock < 10);
    const outOfStockProducts = products.filter((p: any) => p.totalStock === 0);
    const totalStockValue = products.reduce((sum: number, p: any) => {
      return sum + (p.totalStock || 0) * (p.pricing && p.pricing.basePrice ? p.pricing.basePrice : 0);
    }, 0);
    const averagePrice = products.length > 0
      ? products.reduce((sum: number, p: any) => sum + (p.pricing && p.pricing.basePrice ? p.pricing.basePrice : 0), 0) / products.length
      : 0;
    const categories = this.db.get('categories') || [];

    return of({
      success: true,
      data: {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        totalStockValue: totalStockValue,
        categoriesCount: categories.length,
        averagePrice: averagePrice
      }
    }).pipe(delay(this.API_DELAY));
  }

  // ==================== EXPORT/IMPORT ====================

  /**
   * Exporter les produits
   */
  exportProducts(filters?: any): Observable<Blob> {
    // Simulation - à implémenter avec vrai export
    const products = this.db.get('products') || [];
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    return of(blob).pipe(delay(this.API_DELAY));
  }

  /**
   * Importer des produits
   */
  importProducts(file: File): Observable<ApiResponse<any>> {
    // Simulation - à implémenter avec vrai import
    return of({
      success: true,
      data: { imported: 0, errors: [] },
      message: 'Import simulé'
    }).pipe(delay(this.API_DELAY));
  }
}


import { Product } from './product';

/**
 * Statut d'un produit
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

/**
 * Type de produit étendu
 */
export type ProductType = 'T-shirt' | 'Hoodie' | 'Pantalon' | 'Surchemise' | 'Casquette' | 'Accessoire' | 'Autre';

/**
 * Matériau étendu
 */
export type MaterialType = 'Coton lourd' | 'Laine' | 'Cuir végétal' | 'Polyester' | 'Viscose' | 'Autre';

/**
 * Variante de produit (taille + couleur)
 */
export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: { name: string; hex: string };
  sku: string;
  price?: number; // Prix spécifique à la variante (optionnel)
  stock: number;
  image?: string; // Image spécifique à la variante
  barcode?: string;
  weight?: number; // Poids en grammes
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Catégorie de produit
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // Pour les sous-catégories
  image?: string;
  order: number; // Pour l'ordre d'affichage
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag/Métadonnée
 */
export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  color?: string; // Couleur pour l'affichage
  description?: string;
}

/**
 * Média (image/vidéo)
 */
export interface ProductMedia {
  id: string;
  productId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  order: number;
  isPrimary: boolean;
  metadata?: {
    width?: number;
    height?: number;
    size?: number; // Taille en bytes
    mimeType?: string;
  };
  createdAt: Date;
}

/**
 * Mouvement de stock
 */
export interface StockMovement {
  id: string;
  variantId: string;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string; // Référence commande, facture, etc.
  warehouseId?: string;
  performedBy: string;
  createdAt: Date;
}

/**
 * Entrepôt
 */
export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Promotion/Coupon
 */
export interface Promotion {
  id: string;
  name: string;
  code?: string; // Code promo (optionnel)
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number; // Pourcentage ou montant fixe
  minPurchase?: number; // Montant minimum d'achat
  maxDiscount?: number; // Montant maximum de réduction
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  productIds?: string[]; // Produits concernés (vide = tous)
  categoryIds?: string[]; // Catégories concernées
  usageLimit?: number; // Limite d'utilisation
  usageCount: number; // Nombre d'utilisations
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prix et tarification
 */
export interface Pricing {
  basePrice: number;
  compareAtPrice?: number; // Prix barré (ancien prix)
  costPrice?: number; // Prix de revient
  margin?: number; // Marge en pourcentage
  taxRate?: number; // Taux de TVA
  currency: string; // 'FCFA' par défaut
}

/**
 * Métadonnées SEO
 */
export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Produit étendu avec toutes les fonctionnalités
 */
export interface ExtendedProduct extends Omit<Product, 'stock' | 'colors' | 'sizes'> {
  // Informations de base
  status: ProductStatus;
  sku: string; // SKU principal
  barcode?: string;
  
  // Catégorisation
  categoryId?: string;
  category?: Category;
  tags?: ProductTag[];
  
  // Variantes
  variants: ProductVariant[];
  
  // Pricing
  pricing: Pricing;
  
  // Stock global (somme de toutes les variantes)
  totalStock: number;
  
  // Médias
  media: ProductMedia[];
  
  // SEO
  seo?: SEOData;
  
  // Métadonnées
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  // Dates
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  
  // Statistiques
  views?: number;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
}

/**
 * Filtres de recherche de produits
 */
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: ProductStatus | ProductStatus[];
  type?: ProductType | ProductType[];
  material?: MaterialType | MaterialType[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean; // Stock < 10
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'stock' | 'salesCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Résultat de recherche paginé
 */
export interface PaginatedProducts {
  products: ExtendedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Statistiques de produit
 */
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
  categoriesCount: number;
  averagePrice: number;
}

/**
 * Données pour l'export
 */
export interface ProductExportData {
  products: ExtendedProduct[];
  categories: Category[];
  exportDate: Date;
  exportedBy?: string;
}


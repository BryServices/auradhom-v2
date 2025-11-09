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
   */
  createPendingOrder(order: any): Observable<ApiResponse<any>> {
    const orders = this.db.get('pending_orders') || [];
    orders.push(order);
    this.db.set('pending_orders', orders);
    this.saveToStorage('auradhom_pending_orders', orders);
    
    return of({
      success: true,
      data: order,
      message: 'Commande créée avec succès'
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
}


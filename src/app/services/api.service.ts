import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, from, catchError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

/**
 * Service API pour gérer les données de la base de données
 * 
 * Ce service utilise Supabase pour stocker les données de manière persistante.
 * En cas de problème avec Supabase, il utilise localStorage comme fallback.
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
  private supabaseService = inject(SupabaseService);
  private readonly API_DELAY = 100; // Réduit car Supabase est plus rapide
  
  // Fallback: Simuler une base de données en mémoire si Supabase n'est pas configuré
  private db: Map<string, any> = new Map();
  private useSupabase: boolean = false;

  constructor() {
    this.useSupabase = this.supabaseService.isConfigured();
    if (!this.useSupabase) {
      console.warn('⚠️ Supabase non configuré. Utilisation de localStorage comme fallback.');
      this.initializeDatabase();
    } else {
      console.log('✅ Supabase configuré et prêt à l\'utilisation.');
    }
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
    if (this.useSupabase) {
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message, data: [] };
          }
          // Convertir les données de la base vers le format de l'application
          const orders = (data || []).map(order => this.mapDbOrderToAppOrder(order));
          return { success: true, data: orders };
        }),
        catchError((error) => {
          console.error('Erreur lors de la récupération des commandes:', error);
          return of({ success: false, error: error.message, data: [] });
        })
      );
    }
    
    // Fallback localStorage
    return of({
      success: true,
      data: this.db.get('pending_orders') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer toutes les commandes validées
   */
  getValidatedOrders(): Observable<ApiResponse<any[]>> {
    if (this.useSupabase) {
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .select('*')
          .eq('status', 'validated')
          .order('created_at', { ascending: false })
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message, data: [] };
          }
          const orders = (data || []).map(order => this.mapDbOrderToAppOrder(order));
          return { success: true, data: orders };
        }),
        catchError((error) => {
          console.error('Erreur lors de la récupération des commandes:', error);
          return of({ success: false, error: error.message, data: [] });
        })
      );
    }
    
    // Fallback localStorage
    return of({
      success: true,
      data: this.db.get('validated_orders') || []
    }).pipe(delay(this.API_DELAY));
  }

  /**
   * Récupérer toutes les commandes rejetées
   */
  getRejectedOrders(): Observable<ApiResponse<any[]>> {
    if (this.useSupabase) {
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .select('*')
          .eq('status', 'rejected')
          .order('created_at', { ascending: false })
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message, data: [] };
          }
          const orders = (data || []).map(order => this.mapDbOrderToAppOrder(order));
          return { success: true, data: orders };
        }),
        catchError((error) => {
          console.error('Erreur lors de la récupération des commandes:', error);
          return of({ success: false, error: error.message, data: [] });
        })
      );
    }
    
    // Fallback localStorage
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
    if (this.useSupabase) {
      // Convertir la commande au format de la base de données
      const dbOrder = this.mapAppOrderToDbOrder(order);
      
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .insert([dbOrder])
          .select()
          .single()
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            // Vérifier si c'est une erreur de doublon
            if (error.code === '23505') {
              return {
                success: false,
                error: 'Cette commande existe déjà',
                data: null
              };
            }
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
          }
          const appOrder = this.mapDbOrderToAppOrder(data);
          console.log('✅ Commande sauvegardée dans Supabase:', order.orderId);
          return {
            success: true,
            data: appOrder,
            message: 'Commande créée et sauvegardée avec succès dans la base de données'
          };
        }),
        catchError((error) => {
          console.error('Erreur lors de la création de la commande:', error);
          return of({ success: false, error: error.message });
        })
      );
    }
    
    // Fallback localStorage
    const orders = this.db.get('pending_orders') || [];
    const existingOrder = orders.find((o: any) => o.id === order.id || o.orderId === order.orderId);
    if (existingOrder) {
      return of({
        success: false,
        error: 'Cette commande existe déjà',
        data: existingOrder
      }).pipe(delay(this.API_DELAY));
    }
    
    orders.push(order);
    this.db.set('pending_orders', orders);
    this.saveToStorage('auradhom_pending_orders', orders);
    
    console.log('✅ Commande sauvegardée dans localStorage:', order.orderId);
    
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
    if (this.useSupabase) {
      const dbOrder = this.mapAppOrderToDbOrder(validatedOrder);
      
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .update({
            status: 'validated',
            validated_at: new Date().toISOString(),
            validated_by: validatedOrder.validatedBy,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId)
          .select()
          .single()
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
          }
          const appOrder = this.mapDbOrderToAppOrder(data);
          return {
            success: true,
            data: appOrder,
            message: 'Commande validée avec succès'
          };
        }),
        catchError((error) => {
          console.error('Erreur lors de la validation de la commande:', error);
          return of({ success: false, error: error.message });
        })
      );
    }
    
    // Fallback localStorage
    const pendingOrders = (this.db.get('pending_orders') || []).filter((o: any) => o.id !== orderId);
    this.db.set('pending_orders', pendingOrders);
    this.saveToStorage('auradhom_pending_orders', pendingOrders);

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
    if (this.useSupabase) {
      return from(
        this.supabaseService.getClient()
          .from('orders')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString(),
            rejected_by: rejectedOrder.rejectedBy,
            rejection_reason: rejectedOrder.rejectionReason,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId)
          .select()
          .single()
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
          }
          const appOrder = this.mapDbOrderToAppOrder(data);
          return {
            success: true,
            data: appOrder,
            message: 'Commande rejetée'
          };
        }),
        catchError((error) => {
          console.error('Erreur lors du rejet de la commande:', error);
          return of({ success: false, error: error.message });
        })
      );
    }
    
    // Fallback localStorage
    const pendingOrders = (this.db.get('pending_orders') || []).filter((o: any) => o.id !== orderId);
    this.db.set('pending_orders', pendingOrders);
    this.saveToStorage('auradhom_pending_orders', pendingOrders);

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
    if (this.useSupabase) {
      // Récupérer la config depuis Supabase
      return from(
        this.supabaseService.getClient()
          .from('app_config')
          .select('*')
          .limit(1)
          .single()
      ).pipe(
        map(({ data: configData, error: configError }) => {
          if (configError || !configData) {
            console.error('Erreur lors de la récupération de la config:', configError);
            // Utiliser les valeurs par défaut
            if (email !== 'ProdigeKoumba@admin.com' || password !== 'KP_PRO2026@Admin') {
              return { success: false, error: 'Identifiants invalides' };
            }
          } else {
            // Vérifier les identifiants
            if (configData.admin_email !== email || configData.admin_password !== password) {
              return { success: false, error: 'Identifiants invalides' };
            }
          }

          // Créer la session admin
          const user = {
            id: '1',
            email: email,
            name: 'Administrateur'
          };

          // Sauvegarder la session dans Supabase (optionnel, on peut aussi utiliser localStorage)
          this.saveToStorage('auradhom_admin_auth', user);

          return {
            success: true,
            data: user,
            message: 'Connexion réussie'
          };
        }),
        catchError((error) => {
          console.error('Erreur lors de la connexion:', error);
          return of({ success: false, error: error.message });
        })
      );
    }
    
    // Fallback localStorage
    let config = this.db.get('app_config');
    if (!config) {
      try {
        const stored = localStorage.getItem('auradhom_app_config');
        if (stored) {
          config = JSON.parse(stored);
          this.db.set('app_config', config);
        }
      } catch {
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
    if (this.useSupabase) {
      return from(
        this.supabaseService.getClient()
          .from('app_config')
          .select('*')
          .limit(1)
          .single()
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            // Retourner la config par défaut
            const defaultConfig = {
              admin: {
                email: 'ProdigeKoumba@admin.com',
                password: 'KP_PRO2026@Admin'
              },
              whatsappPhone: '242050728339'
            };
            return { success: true, data: defaultConfig };
          }
          // Convertir le format de la base vers le format de l'application
          const appConfig = {
            admin: {
              email: data.admin_email,
              password: data.admin_password
            },
            whatsappPhone: data.whatsapp_phone
          };
          return { success: true, data: appConfig };
        }),
        catchError((error) => {
          console.error('Erreur lors de la récupération de la config:', error);
          const defaultConfig = {
            admin: {
              email: 'ProdigeKoumba@admin.com',
              password: 'KP_PRO2026@Admin'
            },
            whatsappPhone: '242050728339'
          };
          return of({ success: true, data: defaultConfig });
        })
      );
    }
    
    // Fallback localStorage
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
    if (this.useSupabase) {
      // Vérifier si une config existe déjà
      return from(
        this.supabaseService.getClient()
          .from('app_config')
          .select('id')
          .limit(1)
      ).pipe(
        switchMap(({ data: existingConfigs, error: selectError }) => {
          const configData = {
            admin_email: config.admin.email,
            admin_password: config.admin.password,
            whatsapp_phone: config.whatsappPhone,
            updated_at: new Date().toISOString()
          };

          if (existingConfigs && existingConfigs.length > 0) {
            // Mettre à jour l'enregistrement existant
            return from(
              this.supabaseService.getClient()
                .from('app_config')
                .update(configData)
                .eq('id', existingConfigs[0].id)
                .select()
                .single()
            );
          } else {
            // Créer un nouvel enregistrement
            return from(
              this.supabaseService.getClient()
                .from('app_config')
                .insert([configData])
                .select()
                .single()
            );
          }
        }),
        map(({ data, error }) => {
          if (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
          }
          const appConfig = {
            admin: {
              email: data.admin_email,
              password: data.admin_password
            },
            whatsappPhone: data.whatsapp_phone
          };
          return { success: true, data: appConfig, message: 'Configuration mise à jour' };
        }),
        catchError((error) => {
          console.error('Erreur lors de la mise à jour de la config:', error);
          return of({ success: false, error: error.message });
        })
      );
    }
    
    // Fallback localStorage
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
    if (this.useSupabase) {
      // Récupérer d'abord la config pour obtenir l'ID
      return this.getConfig().pipe(
        switchMap((configResponse) => {
          let config: any;
          if (!configResponse.success || !configResponse.data) {
            // Créer une nouvelle config si elle n'existe pas
            config = {
              admin: { email, password },
              whatsappPhone: '242050728339'
            };
          } else {
            config = configResponse.data;
            config.admin.email = email;
            config.admin.password = password;
          }
          return this.updateConfig(config);
        }),
        map((response) => {
          if (response.success) {
            return { success: true, message: 'Identifiants mis à jour' };
          }
          return { success: false, error: response.error || 'Erreur lors de la mise à jour' };
        })
      );
    }
    
    // Fallback localStorage
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
    if (this.useSupabase) {
      return this.getConfig().pipe(
        switchMap((configResponse) => {
          let config: any;
          if (!configResponse.success || !configResponse.data) {
            config = {
              admin: {
                email: 'ProdigeKoumba@admin.com',
                password: 'KP_PRO2026@Admin'
              },
              whatsappPhone: phone
            };
          } else {
            config = configResponse.data;
            config.whatsappPhone = phone;
          }
          return this.updateConfig(config);
        }),
        map((response) => {
          if (response.success) {
            return { success: true, message: 'Numéro WhatsApp mis à jour' };
          }
          return { success: false, error: response.error || 'Erreur lors de la mise à jour' };
        })
      );
    }
    
    // Fallback localStorage
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

  // ==================== MAPPING FUNCTIONS ====================

  /**
   * Convertir une commande de l'application vers le format de la base de données
   */
  private mapAppOrderToDbOrder(order: any): any {
    return {
      order_id: order.orderId,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost || 0,
      total: order.total,
      status: order.status,
      whatsapp_message: order.whatsappMessage || '',
      phone: order.phone || '',
      validated_at: order.validatedAt ? new Date(order.validatedAt).toISOString() : null,
      validated_by: order.validatedBy || null,
      rejected_at: order.rejectedAt ? new Date(order.rejectedAt).toISOString() : null,
      rejected_by: order.rejectedBy || null,
      rejection_reason: order.rejectionReason || null,
      created_at: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()
    };
  }

  /**
   * Convertir une commande de la base de données vers le format de l'application
   */
  private mapDbOrderToAppOrder(dbOrder: any): any {
    const order: any = {
      id: dbOrder.id,
      orderId: dbOrder.order_id,
      customer: dbOrder.customer,
      items: dbOrder.items,
      subtotal: parseFloat(dbOrder.subtotal),
      shippingCost: parseFloat(dbOrder.shipping_cost || 0),
      total: parseFloat(dbOrder.total),
      status: dbOrder.status,
      whatsappMessage: dbOrder.whatsapp_message || '',
      phone: dbOrder.phone || '',
      createdAt: new Date(dbOrder.created_at)
    };

    if (dbOrder.status === 'validated') {
      order.validatedAt = new Date(dbOrder.validated_at);
      order.validatedBy = dbOrder.validated_by;
    }

    if (dbOrder.status === 'rejected') {
      order.rejectedAt = new Date(dbOrder.rejected_at);
      order.rejectedBy = dbOrder.rejected_by;
      order.rejectionReason = dbOrder.rejection_reason;
    }

    return order;
  }
}


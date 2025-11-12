import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ApiService } from './api.service';

/**
 * Service de migration des données depuis localStorage vers Supabase
 * 
 * Ce service permet de migrer les données existantes depuis localStorage
 * vers Supabase lorsque la base de données est configurée pour la première fois.
 */
@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private supabaseService = inject(SupabaseService);
  private apiService = inject(ApiService);

  /**
   * Migrer toutes les données depuis localStorage vers Supabase
   */
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.supabaseService.isConfigured()) {
      console.warn('⚠️ Supabase non configuré. Migration annulée.');
      return;
    }

    console.log('🔄 Début de la migration depuis localStorage vers Supabase...');

    try {
      // Migrer les commandes
      await this.migrateOrders();
      
      // Migrer la configuration
      await this.migrateConfig();

      console.log('✅ Migration terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }

  /**
   * Migrer les commandes depuis localStorage
   */
  private async migrateOrders(): Promise<void> {
    const pendingOrders = this.getFromStorage('auradhom_pending_orders', []);
    const validatedOrders = this.getFromStorage('auradhom_validated_orders', []);
    const rejectedOrders = this.getFromStorage('auradhom_rejected_orders', []);

    const supabase = this.supabaseService.getClient();

    // Migrer les commandes en attente
    if (pendingOrders.length > 0) {
      console.log(`📦 Migration de ${pendingOrders.length} commande(s) en attente...`);
      for (const order of pendingOrders) {
        try {
          const dbOrder = this.mapAppOrderToDbOrder(order);
          const { error } = await supabase
            .from('orders')
            .upsert(dbOrder, { onConflict: 'order_id' });
          
          if (error) {
            console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
          }
        } catch (error) {
          console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
        }
      }
    }

    // Migrer les commandes validées
    if (validatedOrders.length > 0) {
      console.log(`✅ Migration de ${validatedOrders.length} commande(s) validée(s)...`);
      for (const order of validatedOrders) {
        try {
          const dbOrder = this.mapAppOrderToDbOrder(order);
          const { error } = await supabase
            .from('orders')
            .upsert(dbOrder, { onConflict: 'order_id' });
          
          if (error) {
            console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
          }
        } catch (error) {
          console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
        }
      }
    }

    // Migrer les commandes rejetées
    if (rejectedOrders.length > 0) {
      console.log(`❌ Migration de ${rejectedOrders.length} commande(s) rejetée(s)...`);
      for (const order of rejectedOrders) {
        try {
          const dbOrder = this.mapAppOrderToDbOrder(order);
          const { error } = await supabase
            .from('orders')
            .upsert(dbOrder, { onConflict: 'order_id' });
          
          if (error) {
            console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
          }
        } catch (error) {
          console.error(`Erreur lors de la migration de la commande ${order.orderId}:`, error);
        }
      }
    }
  }

  /**
   * Migrer la configuration depuis localStorage
   */
  private async migrateConfig(): Promise<void> {
    const config = this.getFromStorage('auradhom_app_config', null);
    
    if (!config) {
      console.log('ℹ️ Aucune configuration à migrer.');
      return;
    }

    console.log('⚙️ Migration de la configuration...');

    try {
      const supabase = this.supabaseService.getClient();
      
      // Vérifier si une config existe déjà
      const { data: existingConfig } = await supabase
        .from('app_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingConfig) {
        // Mettre à jour la config existante
        const { error } = await supabase
          .from('app_config')
          .update({
            admin_email: config.admin?.email || 'ProdigeKoumba@admin.com',
            admin_password: config.admin?.password || 'KP_PRO2026@Admin',
            whatsapp_phone: config.whatsappPhone || '242050728339',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) {
          console.error('Erreur lors de la mise à jour de la config:', error);
        } else {
          console.log('✅ Configuration mise à jour dans Supabase');
        }
      } else {
        // Créer une nouvelle config
        const { error } = await supabase
          .from('app_config')
          .insert([{
            admin_email: config.admin?.email || 'ProdigeKoumba@admin.com',
            admin_password: config.admin?.password || 'KP_PRO2026@Admin',
            whatsapp_phone: config.whatsappPhone || '242050728339'
          }]);

        if (error) {
          console.error('Erreur lors de la création de la config:', error);
        } else {
          console.log('✅ Configuration créée dans Supabase');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la migration de la config:', error);
    }
  }

  /**
   * Lire depuis localStorage
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
}


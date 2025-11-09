import { Injectable, inject } from '@angular/core';
import { Order, PendingOrder, ValidatedOrder, RejectedOrder } from '../models/order';
import { ApiService } from './api.service';

/**
 * Service de sauvegarde de fichiers pour exporter les commandes
 * Sauvegarde les commandes dans un fichier JSON téléchargeable
 */
@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  private apiService = inject(ApiService);

  /**
   * Sauvegarder toutes les commandes dans un fichier JSON
   */
  async saveAllOrdersToFile(): Promise<void> {
    try {
      const allOrders = await this.getAllOrders();
      this.createOrdersFile(allOrders.pending, allOrders.validated, allOrders.rejected);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commandes:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder une commande individuelle (mise à jour du backup localStorage)
   */
  async saveOrderToFile(order: PendingOrder | ValidatedOrder | RejectedOrder): Promise<void> {
    try {
      // Sauvegarder dans localStorage comme backup
      const storageKey = 'auradhom_orders_backup';
      let allOrders: Order[] = [];
      
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          allOrders = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Erreur lors de la lecture du backup:', error);
      }

      // Vérifier si la commande existe déjà
      const existingIndex = allOrders.findIndex((o: any) => o.id === order.id || o.orderId === order.orderId);
      if (existingIndex >= 0) {
        allOrders[existingIndex] = order;
      } else {
        allOrders.push(order);
      }

      // Sauvegarder dans localStorage
      localStorage.setItem(storageKey, JSON.stringify(allOrders));
      console.log('✅ Commande mise à jour dans le backup localStorage:', order.orderId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande:', error);
    }
  }

  /**
   * Récupérer toutes les commandes
   */
  private async getAllOrders(): Promise<{
    pending: PendingOrder[];
    validated: ValidatedOrder[];
    rejected: RejectedOrder[];
    all: Order[];
  }> {
    return new Promise((resolve) => {
      const result = {
        pending: [] as PendingOrder[],
        validated: [] as ValidatedOrder[],
        rejected: [] as RejectedOrder[],
        all: [] as Order[]
      };

      let loadedCount = 0;
      const totalRequests = 3;

      const checkComplete = () => {
        loadedCount++;
        if (loadedCount === totalRequests) {
          result.all = [...result.pending, ...result.validated, ...result.rejected];
          resolve(result);
        }
      };

      // Charger les commandes en attente
      this.apiService.getPendingOrders().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            result.pending = response.data;
          }
          checkComplete();
        },
        error: () => checkComplete()
      });

      // Charger les commandes validées
      this.apiService.getValidatedOrders().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            result.validated = response.data;
          }
          checkComplete();
        },
        error: () => checkComplete()
      });

      // Charger les commandes rejetées
      this.apiService.getRejectedOrders().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            result.rejected = response.data;
          }
          checkComplete();
        },
        error: () => checkComplete()
      });
    });
  }

  /**
   * Mettre à jour les listes de commandes par statut
   */
  private updateOrdersByStatus(
    allOrders: { pending: PendingOrder[]; validated: ValidatedOrder[]; rejected: RejectedOrder[]; all: Order[] },
    order: Order
  ): void {
    // Retirer la commande des listes existantes
    allOrders.pending = allOrders.pending.filter(o => o.id !== order.id);
    allOrders.validated = allOrders.validated.filter(o => o.id !== order.id);
    allOrders.rejected = allOrders.rejected.filter(o => o.id !== order.id);

    // Ajouter dans la bonne liste selon le statut
    if (order.status === 'pending') {
      allOrders.pending.push(order as PendingOrder);
    } else if (order.status === 'validated') {
      allOrders.validated.push(order as ValidatedOrder);
    } else if (order.status === 'rejected') {
      allOrders.rejected.push(order as RejectedOrder);
    }
  }

  /**
   * Créer et télécharger le fichier JSON des commandes
   */
  private createOrdersFile(pending: PendingOrder[], validated: ValidatedOrder[], rejected: RejectedOrder[]): void {
    const ordersData = {
      exportDate: new Date().toISOString(),
      totalOrders: pending.length + validated.length + rejected.length,
      pending: pending.length,
      validated: validated.length,
      rejected: rejected.length,
      orders: {
        pending: pending,
        validated: validated,
        rejected: rejected
      }
    };

    // Convertir en JSON avec formatage
    const jsonContent = JSON.stringify(ordersData, null, 2);
    
    // Créer un blob
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes-auradhom-${new Date().toISOString().split('T')[0]}.json`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libérer l'URL
    URL.revokeObjectURL(url);
    
    console.log('✅ Fichier de commandes téléchargé:', link.download);
  }

  /**
   * Sauvegarder automatiquement une commande après sa création
   * Sauvegarde dans localStorage pour backup, pas de téléchargement automatique
   */
  async autoSaveOrder(order: PendingOrder): Promise<void> {
    try {
      // Sauvegarder dans localStorage comme backup
      const storageKey = 'auradhom_orders_backup';
      let allOrders: Order[] = [];
      
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          allOrders = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Erreur lors de la lecture du backup:', error);
      }

      // Vérifier si la commande existe déjà
      const existingIndex = allOrders.findIndex((o: any) => o.id === order.id || o.orderId === order.orderId);
      if (existingIndex >= 0) {
        allOrders[existingIndex] = order;
      } else {
        allOrders.push(order);
      }

      // Sauvegarder dans localStorage
      localStorage.setItem(storageKey, JSON.stringify(allOrders));
      console.log('✅ Commande sauvegardée dans le backup localStorage:', order.orderId);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
      // Ne pas bloquer le processus en cas d'erreur
    }
  }

  /**
   * Exporter toutes les commandes dans un fichier JSON téléchargeable
   */
  async exportAllOrdersToFile(): Promise<void> {
    try {
      await this.saveAllOrdersToFile();
    } catch (error) {
      console.error('Erreur lors de l\'export des commandes:', error);
      throw error;
    }
  }
}


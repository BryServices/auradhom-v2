import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, PendingOrder, ValidatedOrder, RejectedOrder, OrderStatus, OrderFilters } from '../models/order';
import { Customer } from '../models/customer';
import { CartItem } from './cart.service';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiService = inject(ApiService);
  private pendingOrders = signal<PendingOrder[]>([]);
  private validatedOrders = signal<ValidatedOrder[]>([]);
  private rejectedOrders = signal<RejectedOrder[]>([]);

  private ordersChanged = new BehaviorSubject<void>(undefined);

  constructor(private notificationService: NotificationService) {
    // Charger les données depuis l'API
    this.loadOrdersFromApi();

    // Écouter les changements pour les notifications avec effect()
    effect(() => {
      const orders: PendingOrder[] = this.pendingOrders();
      if (orders.length > 0) {
        // Vérifier s'il y a une nouvelle commande
        const lastOrder = orders[orders.length - 1];
        if (lastOrder && this.isNewOrder(lastOrder)) {
          this.notificationService.notifyNewOrder(lastOrder);
        }
      }
    });
  }

  /**
   * Charger toutes les commandes depuis l'API
   * Cette méthode charge les commandes depuis la base de données
   */
  private loadOrdersFromApi(): void {
    // Charger les commandes en attente
    this.apiService.getPendingOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt)
          }));
          this.pendingOrders.set(orders);
          this.ordersChanged.next(); // Notifier les changements
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes en attente', error);
      }
    });

    // Charger les commandes validées
    this.apiService.getValidatedOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
            validatedAt: new Date(o.validatedAt)
          }));
          this.validatedOrders.set(orders);
          this.ordersChanged.next(); // Notifier les changements
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes validées', error);
      }
    });

    // Charger les commandes rejetées
    this.apiService.getRejectedOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
            rejectedAt: new Date(o.rejectedAt)
          }));
          this.rejectedOrders.set(orders);
          this.ordersChanged.next(); // Notifier les changements
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes rejetées', error);
      }
    });
  }

  /**
   * Recharger toutes les commandes depuis la base de données
   * Méthode publique pour permettre le rafraîchissement manuel
   * Utile pour détecter les nouvelles commandes créées sur le site
   */
  refreshOrdersFromDatabase(): void {
    this.loadOrdersFromApi();
  }

  // Créer une nouvelle commande en attente
  // IMPORTANT: La commande est IMMÉDIATEMENT sauvegardée dans la base de données via l'API
  createPendingOrder(
    customer: Customer,
    items: CartItem[],
    whatsappMessage: string
  ): PendingOrder {
    const orderId = this.generateOrderId();
    const order: PendingOrder = {
      id: this.generateId(),
      orderId: orderId,
      customer: customer,
      items: items.map(item => ({ ...item })),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shippingCost: 0,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      whatsappMessage: whatsappMessage,
      phone: customer.phone || ''
    };

    // SAUVEGARDER IMMÉDIATEMENT DANS LA BASE DE DONNÉES VIA L'API
    // La commande est stockée dans la BD avant d'être visible dans le dashboard
    this.apiService.createPendingOrder(order).subscribe({
      next: (response) => {
        if (response.success) {
          // Mettre à jour le signal local seulement après confirmation de la sauvegarde
          const orders = [...this.pendingOrders(), order];
          this.pendingOrders.set(orders);
          this.ordersChanged.next();
          console.log('Commande sauvegardée dans la base de données:', order.orderId);
        } else {
          console.error('Échec de la sauvegarde de la commande:', response.error);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la commande dans la BD', error);
        // Même en cas d'erreur, on ajoute localement pour ne pas perdre la commande
        const orders = [...this.pendingOrders(), order];
        this.pendingOrders.set(orders);
        this.ordersChanged.next();
      }
    });

    return order;
  }

  // Valider une commande
  validateOrder(orderId: string, validatedBy: string): ValidatedOrder | null {
    const order = this.pendingOrders().find(o => o.id === orderId);
    if (!order) return null;

    const validatedOrder: ValidatedOrder = {
      ...order,
      status: OrderStatus.VALIDATED,
      validatedAt: new Date(),
      validatedBy: validatedBy
    };

    // Sauvegarder via l'API
    this.apiService.validateOrder(orderId, validatedOrder).subscribe({
      next: (response) => {
        if (response.success) {
          // Retirer de pending et ajouter à validated
          const pending = this.pendingOrders().filter(o => o.id !== orderId);
          this.pendingOrders.set(pending);

          const validated = [...this.validatedOrders(), validatedOrder];
          this.validatedOrders.set(validated);

          this.ordersChanged.next();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la validation de la commande', error);
      }
    });

    return validatedOrder;
  }

  // Rejeter une commande
  rejectOrder(orderId: string, rejectedBy: string, rejectionReason: string): RejectedOrder | null {
    const order = this.pendingOrders().find(o => o.id === orderId);
    if (!order) return null;

    const rejectedOrder: RejectedOrder = {
      ...order,
      status: OrderStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedBy: rejectedBy,
      rejectionReason: rejectionReason
    };

    // Sauvegarder via l'API
    this.apiService.rejectOrder(orderId, rejectedOrder).subscribe({
      next: (response) => {
        if (response.success) {
          // Retirer de pending et ajouter à rejected
          const pending = this.pendingOrders().filter(o => o.id !== orderId);
          this.pendingOrders.set(pending);

          const rejected = [...this.rejectedOrders(), rejectedOrder];
          this.rejectedOrders.set(rejected);

          this.ordersChanged.next();
        }
      },
      error: (error) => {
        console.error('Erreur lors du rejet de la commande', error);
      }
    });

    return rejectedOrder;
  }

  // Obtenir toutes les commandes en attente
  getPendingOrders(): Observable<PendingOrder[]> {
    return new BehaviorSubject(this.pendingOrders());
  }

  getPendingOrdersSignal() {
    return this.pendingOrders;
  }

  // Obtenir toutes les commandes validées
  getValidatedOrders(): Observable<ValidatedOrder[]> {
    return new BehaviorSubject(this.validatedOrders());
  }

  getValidatedOrdersSignal() {
    return this.validatedOrders;
  }

  // Obtenir toutes les commandes rejetées
  getRejectedOrders(): Observable<RejectedOrder[]> {
    return new BehaviorSubject(this.rejectedOrders());
  }

  getRejectedOrdersSignal() {
    return this.rejectedOrders;
  }

  // Obtenir une commande par ID
  getOrderById(orderId: string): Order | null {
    const allOrders = [
      ...this.pendingOrders(),
      ...this.validatedOrders(),
      ...this.rejectedOrders()
    ];
    return allOrders.find(o => o.id === orderId) || null;
  }

  // Filtrer les commandes
  filterOrders(filters: OrderFilters): Order[] {
    let orders: Order[] = [];

    if (filters.status === OrderStatus.PENDING || !filters.status) {
      orders = [...orders, ...this.pendingOrders()];
    }
    if (filters.status === OrderStatus.VALIDATED || !filters.status) {
      orders = [...orders, ...this.validatedOrders()];
    }
    if (filters.status === OrderStatus.REJECTED || !filters.status) {
      orders = [...orders, ...this.rejectedOrders()];
    }

    // Appliquer les filtres
    if (filters.dateFrom) {
      orders = orders.filter(o => o.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      orders = orders.filter(o => o.createdAt <= filters.dateTo!);
    }
    if (filters.customerName) {
      const search = filters.customerName.toLowerCase();
      orders = orders.filter(o =>
        o.customer.firstName.toLowerCase().includes(search) ||
        o.customer.lastName.toLowerCase().includes(search)
      );
    }
    if (filters.orderId) {
      orders = orders.filter(o => o.orderId.includes(filters.orderId!));
    }

    return orders;
  }

  // Compteurs
  getPendingCount(): number {
    return this.pendingOrders().length;
  }

  getValidatedCount(): number {
    return this.validatedOrders().length;
  }

  // Écouter les changements
  onOrdersChanged(): Observable<void> {
    return this.ordersChanged.asObservable();
  }

  // Génération d'ID
  private generateId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ADH-${timestamp}-${random}`;
  }


  // Vérifier si une commande est nouvelle (pour les notifications)
  private lastOrderId: string | null = null;
  private isNewOrder(order: PendingOrder): boolean {
    if (this.lastOrderId === order.id) {
      return false;
    }
    this.lastOrderId = order.id;
    return true;
  }
}


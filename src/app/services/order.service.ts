import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, PendingOrder, ValidatedOrder, RejectedOrder, OrderStatus, OrderFilters } from '../models/order';
import { Customer } from '../models/customer';
import { CartItem } from './cart.service';
import { NotificationService } from './notification.service';

const STORAGE_PENDING_KEY = 'auradhom_pending_orders';
const STORAGE_VALIDATED_KEY = 'auradhom_validated_orders';
const STORAGE_REJECTED_KEY = 'auradhom_rejected_orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private pendingOrders = signal<PendingOrder[]>(this.loadPendingOrders());
  private validatedOrders = signal<ValidatedOrder[]>(this.loadValidatedOrders());
  private rejectedOrders = signal<RejectedOrder[]>(this.loadRejectedOrders());

  private ordersChanged = new BehaviorSubject<void>(undefined);

  constructor(private notificationService: NotificationService) {
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

  // Créer une nouvelle commande en attente
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
      phone: customer.phone
    };

    const orders = [...this.pendingOrders(), order];
    this.pendingOrders.set(orders);
    this.savePendingOrders(orders);
    this.ordersChanged.next();

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

    // Retirer de pending et ajouter à validated
    const pending = this.pendingOrders().filter(o => o.id !== orderId);
    this.pendingOrders.set(pending);
    this.savePendingOrders(pending);

    const validated = [...this.validatedOrders(), validatedOrder];
    this.validatedOrders.set(validated);
    this.saveValidatedOrders(validated);

    this.ordersChanged.next();
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

    // Retirer de pending et ajouter à rejected
    const pending = this.pendingOrders().filter(o => o.id !== orderId);
    this.pendingOrders.set(pending);
    this.savePendingOrders(pending);

    const rejected = [...this.rejectedOrders(), rejectedOrder];
    this.rejectedOrders.set(rejected);
    this.saveRejectedOrders(rejected);

    this.ordersChanged.next();
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

  // Chargement depuis localStorage
  private loadPendingOrders(): PendingOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_PENDING_KEY);
      if (!stored) return [];
      const orders = JSON.parse(stored);
      return orders.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private loadValidatedOrders(): ValidatedOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_VALIDATED_KEY);
      if (!stored) return [];
      const orders = JSON.parse(stored);
      return orders.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        validatedAt: new Date(o.validatedAt)
      }));
    } catch {
      return [];
    }
  }

  private loadRejectedOrders(): RejectedOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_REJECTED_KEY);
      if (!stored) return [];
      const orders = JSON.parse(stored);
      return orders.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        rejectedAt: new Date(o.rejectedAt)
      }));
    } catch {
      return [];
    }
  }

  // Sauvegarde dans localStorage
  private savePendingOrders(orders: PendingOrder[]): void {
    try {
      localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commandes en attente', error);
    }
  }

  private saveValidatedOrders(orders: ValidatedOrder[]): void {
    try {
      localStorage.setItem(STORAGE_VALIDATED_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commandes validées', error);
    }
  }

  private saveRejectedOrders(orders: RejectedOrder[]): void {
    try {
      localStorage.setItem(STORAGE_REJECTED_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commandes rejetées', error);
    }
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


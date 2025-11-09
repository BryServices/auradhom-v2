import { Component, OnInit, inject, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { PdfService } from '../../../services/pdf.service';
import { PendingOrder, ValidatedOrder, RejectedOrder, OrderStatus, OrderFilters } from '../../../models/order';
import { FormatFcfaPipe } from '../../../pipes/format-fcfa.pipe';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormatFcfaPipe],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit {
  orderType = input<'pending' | 'validated' | 'rejected' | 'all'>('pending');
  
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private pdfService = inject(PdfService);
  private router = inject(Router);

  orders = signal<(PendingOrder | ValidatedOrder | RejectedOrder)[]>([]);
  filters = signal<OrderFilters>({});
  
  showRejectionModal = signal(false);
  selectedOrder = signal<PendingOrder | null>(null);
  rejectionReason = signal('');

  // Filtres de recherche
  searchTerm = signal('');
  dateFrom = signal('');
  dateTo = signal('');
  statusFilter = signal<OrderStatus | 'all'>('all');

  ngOnInit(): void {
    this.loadOrders();
    this.orderService.onOrdersChanged().subscribe(() => {
      this.loadOrders();
    });
  }

  loadOrders(): void {
    let orders: (PendingOrder | ValidatedOrder | RejectedOrder)[] = [];

    if (this.orderType() === 'pending') {
      orders = this.orderService.getPendingOrdersSignal()();
    } else if (this.orderType() === 'validated') {
      orders = this.orderService.getValidatedOrdersSignal()();
    } else if (this.orderType() === 'rejected') {
      orders = this.orderService.getRejectedOrdersSignal()();
    } else {
      // Toutes les commandes
      orders = [
        ...this.orderService.getPendingOrdersSignal()(),
        ...this.orderService.getValidatedOrdersSignal()(),
        ...this.orderService.getRejectedOrdersSignal()()
      ];
    }

    // Appliquer les filtres
    orders = this.applyFilters(orders);
    this.orders.set(orders);
  }

  applyFilters(orders: (PendingOrder | ValidatedOrder | RejectedOrder)[]): (PendingOrder | ValidatedOrder | RejectedOrder)[] {
    let filtered = [...orders];

    // Filtre par terme de recherche
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(term) ||
        order.customer.firstName.toLowerCase().includes(term) ||
        order.customer.lastName.toLowerCase().includes(term) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(term)
      );
    }

    // Filtre par date
    if (this.dateFrom()) {
      const fromDate = new Date(this.dateFrom());
      filtered = filtered.filter(order => order.createdAt >= fromDate);
    }
    if (this.dateTo()) {
      const toDate = new Date(this.dateTo());
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => order.createdAt <= toDate);
    }

    // Filtre par statut
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter());
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return filtered;
  }

  onSearch(): void {
    this.loadOrders();
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.statusFilter.set('all');
    this.loadOrders();
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/admin/dashboard/orders', orderId]);
  }

  validateOrder(order: PendingOrder): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const validated = this.orderService.validateOrder(order.id, user.name);
    if (validated) {
      this.loadOrders();
    }
  }

  openRejectionModal(order: PendingOrder): void {
    this.selectedOrder.set(order);
    this.rejectionReason.set('');
    this.showRejectionModal.set(true);
  }

  closeRejectionModal(): void {
    this.showRejectionModal.set(false);
    this.selectedOrder.set(null);
    this.rejectionReason.set('');
  }

  rejectOrder(): void {
    const order = this.selectedOrder();
    if (!order || !this.rejectionReason().trim()) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const rejected = this.orderService.rejectOrder(order.id, user.name, this.rejectionReason().trim());
    if (rejected) {
      this.closeRejectionModal();
      this.loadOrders();
    }
  }

  downloadReceipt(order: ValidatedOrder): void {
    this.pdfService.generateOrderReceipt(order);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.VALIDATED:
        return 'Validée';
      case OrderStatus.REJECTED:
        return 'Rejetée';
      default:
        return status;
    }
  }

  getOrderStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.VALIDATED:
        return 'status-validated';
      case OrderStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  hasRejectionReason(order: PendingOrder | ValidatedOrder | RejectedOrder): boolean {
    return order.status === OrderStatus.REJECTED && 'rejectionReason' in order;
  }

  getRejectionReason(order: PendingOrder | ValidatedOrder | RejectedOrder): string {
    if (order.status === OrderStatus.REJECTED && 'rejectionReason' in order) {
      return (order as RejectedOrder).rejectionReason;
    }
    return '';
  }
}


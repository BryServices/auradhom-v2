import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { OrdersListComponent } from '../orders-list/orders-list.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, OrdersListComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = signal(this.authService.getCurrentUser());
  pendingCount = computed(() => this.orderService.getPendingOrdersSignal()().length);
  validatedCount = computed(() => this.orderService.getValidatedOrdersSignal()().length);
  unreadNotifications = signal(0);

  activeTab = signal<'pending' | 'validated' | 'history'>('pending');
  showNotifications = signal(false);
  notifications = signal<any[]>([]);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadNotifications();

    // Écouter les changements de commandes
    this.orderService.onOrdersChanged().subscribe(() => {
      // Les compteurs se mettront à jour automatiquement via les computed signals
    });

    // Écouter les notifications
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications.set(notifications);
      this.unreadNotifications.set(notifications.filter(n => !n.read).length);
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications.set(notifications.slice(0, 10)); // Dernières 10 notifications
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
    if (this.showNotifications()) {
      this.notificationService.markAllAsRead();
    }
  }

  setActiveTab(tab: 'pending' | 'validated' | 'history'): void {
    this.activeTab.set(tab);
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
}


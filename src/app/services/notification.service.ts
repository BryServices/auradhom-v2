import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PendingOrder } from '../models/order';

export interface Notification {
  id: string;
  type: 'new_order' | 'info' | 'success' | 'error';
  message: string;
  orderId?: string;
  createdAt: Date;
  read: boolean;
}

const STORAGE_KEY = 'auradhom_notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>(this.loadNotifications());
  private unreadCount = new BehaviorSubject<number>(0);

  constructor() {
    this.updateUnreadCount();
  }

  // Notifier une nouvelle commande
  notifyNewOrder(order: PendingOrder): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'new_order',
      message: `Nouvelle commande ${order.orderId} de ${order.customer.firstName} ${order.customer.lastName}`,
      orderId: order.id,
      createdAt: new Date(),
      read: false
    };

    const notifications = [notification, ...this.notifications.value];
    this.notifications.next(notifications);
    this.saveNotifications(notifications);
    this.updateUnreadCount();

    // Optionnel : envoyer un email (nécessite un backend)
    // this.sendEmailNotification(order);
  }

  // Obtenir les notifications
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: string): void {
    const notifications = this.notifications.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.next(notifications);
    this.saveNotifications(notifications);
    this.updateUnreadCount();
  }

  // Marquer toutes comme lues
  markAllAsRead(): void {
    const notifications = this.notifications.value.map(n => ({ ...n, read: true }));
    this.notifications.next(notifications);
    this.saveNotifications(notifications);
    this.updateUnreadCount();
  }

  // Supprimer une notification
  removeNotification(notificationId: string): void {
    const notifications = this.notifications.value.filter(n => n.id !== notificationId);
    this.notifications.next(notifications);
    this.saveNotifications(notifications);
    this.updateUnreadCount();
  }

  // Créer une notification personnalisée
  createNotification(type: Notification['type'], message: string, orderId?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: type,
      message: message,
      orderId: orderId,
      createdAt: new Date(),
      read: false
    };

    const notifications = [notification, ...this.notifications.value];
    this.notifications.next(notifications);
    this.saveNotifications(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = this.notifications.value.filter(n => !n.read).length;
    this.unreadCount.next(count);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications', error);
    }
  }

  // Méthode pour envoyer un email (nécessite un backend)
  // private async sendEmailNotification(order: PendingOrder): Promise<void> {
  //   // Implémenter l'envoi d'email via votre backend
  // }
}


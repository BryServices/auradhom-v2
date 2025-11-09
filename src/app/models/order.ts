import { Customer } from './customer';
import { CartItem } from '../services/cart.service';

export enum OrderStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected'
}

export interface OrderItem extends CartItem {
  // Les propriétés de CartItem sont déjà définies
}

export interface PendingOrder {
  id: string;
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus.PENDING;
  createdAt: Date;
  whatsappMessage: string;
  phone?: string;
}

export interface ValidatedOrder {
  id: string;
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus.VALIDATED;
  createdAt: Date;
  validatedAt: Date;
  validatedBy: string;
  whatsappMessage: string;
  phone?: string;
}

export interface RejectedOrder {
  id: string;
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus.REJECTED;
  createdAt: Date;
  rejectedAt: Date;
  rejectedBy: string;
  rejectionReason: string;
  whatsappMessage: string;
  phone?: string;
}

export type Order = PendingOrder | ValidatedOrder | RejectedOrder;

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerName?: string;
  orderId?: string;
}


import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { FormatFcfaPipe } from '../../pipes/format-fcfa.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatFcfaPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  private cart = inject(CartService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  
  items = this.cart.getItems();
  total = this.cart.total;

  remove(index: number) { this.cart.remove(index); }
  clear() { this.cart.clear(); }

  proceedToCheckout() {
    if (!this.customerService.hasRequiredInfo()) {
      this.router.navigate(['/customer-info']);
      return;
    }

    const cartItems = this.items();
    if (!cartItems.length) return;

    const orderData = {
      productName: cartItems.map(item => item.name).join(', '),
      size: cartItems.map(item => item.selectedSize).filter(Boolean).join(', '),
      color: cartItems.map(item => item.selectedColor).filter(Boolean).join(', '),
      quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      price: cartItems[0].price,
      subtotal: this.cart.getSubtotal(),
      shippingCost: this.cart.getShippingCost(),
      total: this.total()
    };

    const message = this.customerService.formatWhatsAppMessage(orderData);
    const whatsappLink = this.customerService.getWhatsAppLink(message);
    window.open(whatsappLink, '_blank');

  increment(index: number) {
    const it = this.items()[index];
    if (!it) return;
    this.cart.updateQuantity(index, it.quantity + 1);
  }

  decrement(index: number) {
    const it = this.items()[index];
    if (!it) return;
    if (it.quantity > 1) this.cart.updateQuantity(index, it.quantity - 1);
  }

  onQtyInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (Number.isNaN(value) || value < 1) {
      this.cart.updateQuantity(index, 1);
      input.value = '1';
    } else {
      this.cart.updateQuantity(index, Math.floor(value));
    }
  }
}



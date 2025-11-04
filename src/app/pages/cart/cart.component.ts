import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
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
  items = this.cart.getItems();
  total = this.cart.total;

  remove(index: number) { this.cart.remove(index); }
  clear() { this.cart.clear(); }

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



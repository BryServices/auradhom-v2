import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false;
  private cart = inject(CartService);
  cartCount = this.cart.count;
  animate = signal(false);

  // Trigger a small animation when cart count changes
  // The effect runs whenever cartCount() is read and changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _bumpEffect = effect(() => {
    const _ = this.cartCount();
    this.animate.set(true);
    window.setTimeout(() => this.animate.set(false), 300);
  });

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

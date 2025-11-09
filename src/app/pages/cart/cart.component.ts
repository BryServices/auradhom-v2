import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
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
  private orderService = inject(OrderService);
  private router = inject(Router);
  
  items = this.cart.getItems();
  total = this.cart.total;

  remove(index: number) { this.cart.remove(index); }
  clear() { this.cart.clear(); }

  proceedToCheckout() {
    const cartItems = this.items();
    if (!cartItems.length) return;

    // Vérifier si les informations client sont complètes
    if (!this.customerService.hasRequiredInfo()) {
      this.router.navigate(['/customer-info']);
      return;
    }

    // Récupérer les informations client (valeur synchrone)
    const customer = this.customerService.getCustomerInfoValue();
    if (!customer) {
      this.router.navigate(['/customer-info']);
      return;
    }

    // Préparer les données de commande
    const orderData = {
      items: cartItems,
      subtotal: this.cart.getSubtotal(),
      shippingCost: this.cart.getShippingCost(),
      total: this.total()
    };

    // Générer le message WhatsApp
    const message = this.customerService.formatWhatsAppMessage(orderData);
    
    // IMPORTANT: CRÉER ET SAUVEGARDER LA COMMANDE DANS LA BASE DE DONNÉES
    // La commande doit être sauvegardée dans la BD avant d'ouvrir WhatsApp
    // Cela garantit que toutes les commandes sont stockées pour être gérées dans le dashboard
    this.orderService.createPendingOrder(customer, cartItems, message);
    
    // Ouvrir WhatsApp
    const whatsappLink = this.customerService.getWhatsAppLink(message);
    window.open(whatsappLink, '_blank');
    
    // Effacer les données après la sauvegarde de la commande
    // Vider le panier
    this.cart.clear();
    
    // Supprimer les informations client
    this.customerService.clearCustomerInfo();
    
    // Rediriger vers la page de confirmation
    setTimeout(() => {
      this.router.navigate(['/envoye']);
    }, 500);
  }

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



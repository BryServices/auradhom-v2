import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cart = inject(CartService);

  products: Product[] = [];
  filtered: Product[] = [];
  searchTerm = '';

  // simple autoplay for the featured carousel
  private carouselTimer: any = null;

  ngOnInit() {
    this.productService.getProducts().subscribe(list => {
      this.products = list || [];
      this.filtered = [...this.products];
    });

    // start simple autoplay (will be cleared on destroy)
    this.carouselTimer = setInterval(() => this.nextFeatured(), 5000);
  }

  ngOnDestroy() {
    if (this.carouselTimer) clearInterval(this.carouselTimer);
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    const q = value.trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.products];
      return;
    }
    this.filtered = this.products.filter(p => (p.name + ' ' + p.description).toLowerCase().includes(q));
  }

  nextFeatured() {
    const el = document.getElementById('featured-carousel');
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: w, behavior: 'smooth' });
  }

  prevFeatured() {
    const el = document.getElementById('featured-carousel');
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: -w, behavior: 'smooth' });
  }

  addToCart(product: Product) {
    this.cart.add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: product.sizes?.[0] || null,
      color: product.colors?.[0]?.name || null
    });
  }
}

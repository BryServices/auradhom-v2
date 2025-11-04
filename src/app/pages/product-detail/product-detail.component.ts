import { Component, Input, computed, inject, signal, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FormatFcfaPipe } from '../../pipes/format-fcfa.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../services/cart.service';
// Note: WhatsApp ordering removed; constants kept for other pages.
declare const require: any;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormatFcfaPipe, LucideAngularModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnChanges, OnInit {
  @Input() slug = '';
  
  private productService = inject(ProductService);
  private cart = inject(CartService);

  product = signal<Product | undefined>(undefined);
  selectedSize = signal<string | undefined>(undefined);
  selectedColor = signal<{ name: string; hex: string } | undefined>(undefined);
  quantity = signal(1);
  imageFade = signal(false);

  openAccordion = signal<string | null>(null);

  // Galerie d'images et image courante
  currentImage: string = '';
  productImages: string[] = [];

  constructor() {}

  ngOnInit(): void {
    // Charge automatiquement toutes les images situées dans assets/infos-T/1 et assets/infos-T/2
    // Utilise require.context (webpack) pris en charge par Angular CLI
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = (require as any).context(
        'assets/infos-T',
        true,
        /\.(png|jpe?g|webp|gif|svg)$/i
      );
      const keys: string[] = req.keys();
      const images = keys
        .filter(k => /\/([12])\//.test(k))
        .map(k => `assets/infos-T${k.replace(/^\./, '')}`);
      this.productImages = images;
    } catch {
      // Fallback: si require.context n'est pas disponible, on garde un tableau vide
      this.productImages = [];
    }

    if (this.productImages.length > 0) {
      this.currentImage = this.productImages[0];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slug'] && this.slug) {
      this.productService.getProductBySlug(this.slug).subscribe(p => {
        this.product.set(p);
        if (p?.sizes.length === 1) this.selectedSize.set(p.sizes[0]);
        if (p?.colors.length === 1) this.selectedColor.set(p.colors[0]);
        // Défaut: si aucune image courante définie, on utilise p.image
        if (!this.currentImage && p?.image) {
          this.currentImage = p.image;
        }
      });
    }
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  selectColor(color: { name: string; hex: string }) {
    this.selectedColor.set(color);
  }

  toggleAccordion(section: string) {
    this.openAccordion.set(this.openAccordion() === section ? null : section);
  }

  // WhatsApp ordering removed as per requirements

  addToCart() {
    const p = this.product();
    if (!p || !this.selectedSize() || !this.selectedColor()) {
      alert('Veuillez sélectionner une taille et une couleur.');
      return;
    }
    this.cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: this.currentImage || p.image,
      size: this.selectedSize(),
      color: this.selectedColor()!.name,
      quantity: this.quantity(),
    });
    alert('Ajouté au panier.');
  }

  selectImage(img: string): void {
    if (!img) return;
    this.currentImage = img;
  }

  incrementQuantity(): void {
    const current = this.quantity();
    this.quantity.set(current + 1);
  }

  decrementQuantity(): void {
    const current = this.quantity();
    if (current > 1) this.quantity.set(current - 1);
  }

  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (Number.isNaN(value) || value < 1) {
      this.quantity.set(1);
      input.value = '1';
    } else {
      this.quantity.set(Math.floor(value));
    }
  }
}

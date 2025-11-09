import { Component, Input, inject, signal, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FormatFcfaPipe } from '../../pipes/format-fcfa.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../services/cart.service';
import { PreloadService } from '../../services/preload.service';

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
  private preload = inject(PreloadService);

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

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slug'] && this.slug) {
      this.productService.getProductBySlug(this.slug).subscribe((p: Product | undefined) => {
        this.product.set(p);
        if (!p) return;
        
        if (p.sizes && p.sizes.length === 1) this.selectedSize.set(p.sizes[0]);
        if (p.colors && p.colors.length === 1) this.selectedColor.set(p.colors[0]);
        // Alimente les vignettes à partir des visuels de la couleur principale (trouvée en premier)
        if (p.colors && p.colors.length > 0) {
          const firstColor = p.colors[0];
          const mainColor = firstColor && firstColor.name ? firstColor.name : '';
          const isBeige = this.normalizeColorName(mainColor) === 'beige' && p.name.toLowerCase().includes('beige');
          
          this.preload.findColorThumbnails(mainColor).then((imgs: string[]) => {
            if (isBeige) {
              // Cas spécial pour beige : garantir que biege.png est la 3ème vignette
              const biegeImage = 'assets/biege.png';
              if (imgs.length >= 3) {
                // Si on a déjà 3+ images, remplacer la 3ème par biege.png si elle n'y est pas déjà
                const finalImages = imgs.slice(0, 2);
                if (!imgs.includes(biegeImage)) {
                  finalImages.push(biegeImage);
                } else {
                  finalImages.push(...imgs.slice(2, 3));
                }
                this.productImages = finalImages;
              } else if (imgs.length === 2) {
                // Si seulement 2 images, ajouter biege.png comme 3ème
                this.productImages = [imgs[0], imgs[1], biegeImage];
              } else if (imgs.length === 1) {
                // Si 1 seule image, ajouter biege.png
                this.productImages = [imgs[0], imgs[0], biegeImage];
              } else {
                this.productImages = [this.resolveColorImage(mainColor), this.resolveColorImage(mainColor), biegeImage];
              }
            } else {
              this.productImages = imgs.length ? imgs : [this.resolveColorImage(mainColor)];
            }
            this.currentImage = this.productImages[0] || p.image;
          });
        } else if (p.image) {
          this.productImages = [];
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
    const p = this.product();
    const isBeige = this.normalizeColorName(color.name) === 'beige' && p?.name.toLowerCase().includes('beige');
    
    // Recharge les vignettes liées à cette couleur (noir_1.png, noir_2.png, ...)
    this.preload.findColorThumbnails(color.name).then((imgs: string[]) => {
      if (isBeige) {
        // Cas spécial pour beige : garantir que biege.png est la 3ème vignette
        const biegeImage = 'assets/biege.png';
        if (imgs.length >= 3) {
          const finalImages = imgs.slice(0, 2);
          if (!imgs.includes(biegeImage)) {
            finalImages.push(biegeImage);
          } else {
            finalImages.push(...imgs.slice(2, 3));
          }
          this.productImages = finalImages;
        } else if (imgs.length === 2) {
          this.productImages = [imgs[0], imgs[1], biegeImage];
        } else if (imgs.length === 1) {
          this.productImages = [imgs[0], imgs[0], biegeImage];
        } else {
          this.productImages = [this.resolveColorImage(color.name), this.resolveColorImage(color.name), biegeImage];
        }
      } else {
        this.productImages = imgs.length ? imgs : [this.resolveColorImage(color.name)];
      }
      this.currentImage = this.productImages[0] || this.currentImage;
    });
  }

  toggleAccordion(section: string) {
    this.openAccordion.set(this.openAccordion() === section ? null : section);
  }

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

  private normalizeColorName(name: string): string {
    return (name || '').toString().trim().toLowerCase();
  }

  private resolveColorImage(colorName: string): string {
    const name = this.normalizeColorName(colorName);
    return `assets/infos-T/1/${name}.jpg`;
  }
}

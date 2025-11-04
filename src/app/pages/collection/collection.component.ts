import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PreloadService } from '../../services/preload.service';
import { Product } from '../../models/product';
import { FormatFcfaPipe } from '../../pipes/format-fcfa.pipe';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormatFcfaPipe],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent {
  private productService = inject(ProductService);
  private preloadService = inject(PreloadService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  // Prévisualisation courante par produit (id -> url image)
  previewById = signal<Record<number, string>>({});
  // Thumbnails par produit (id -> urls)
  thumbsById = signal<Record<number, string[]>>({});
  filterOptions = this.productService.getFilterOptions();
  
  filterForm = this.fb.group({
    silhouette: [[] as string[]],
    type: [[] as string[]],
    matiere: [[] as string[]],
    teinte: [[] as string[]]
  });

  filteredProducts = computed(() => {
    const allProducts = this.products();
    const filters = this.filterForm.value;

    if (!filters.silhouette?.length && !filters.type?.length && !filters.matiere?.length && !filters.teinte?.length) {
      return allProducts;
    }

    return allProducts.filter(p => {
      const sizeMatch = !filters.silhouette?.length || p.sizes.some(s => filters.silhouette?.includes(s));
      const typeMatch = !filters.type?.length || filters.type.includes(p.type);
      const materialMatch = !filters.matiere?.length || filters.matiere.includes(p.material);
      const colorMatch = !filters.teinte?.length || p.colors.some(c => filters.teinte?.includes(c.name));
      return sizeMatch && typeMatch && materialMatch && colorMatch;
    });
  });

  isFilterOpen = signal(false);

  constructor() {
    this.productService.getProducts().subscribe(data => {
      this.products.set(data);
      const map: Record<number, string> = {};
      data.forEach(prod => {
        // Par défaut, utilise la première couleur si disponible, sinon l'image du produit
        const firstColor = prod.colors?.[0]?.name;
        if (firstColor) {
          // Image par défaut (structure actuelle)
          const defaultImg = this.resolveColorImage(firstColor);
          map[prod.id] = defaultImg;
          
          // Chercher les images disponibles de manière asynchrone
          this.preloadService.findColorThumbnails(firstColor).then(imgs => {
            const next = { ...this.thumbsById() };
            if (imgs.length > 0) {
              // Prendre les 3 premières images trouvées, ou répéter la première si une seule
              if (imgs.length === 1) {
                next[prod.id] = [imgs[0], imgs[0], imgs[0]]; // Répéter pour avoir 3 vignettes
              } else {
                next[prod.id] = imgs.slice(0, 3);
              }
              const preview = { ...this.previewById() };
              preview[prod.id] = imgs[0];
              this.previewById.set(preview);
            } else {
              // Fallback : utiliser l'image du produit répétée
              next[prod.id] = [prod.image, prod.image, prod.image];
            }
            this.thumbsById.set(next);
          });
        } else {
          map[prod.id] = prod.image;
          const next = { ...this.thumbsById() };
          next[prod.id] = [prod.image, prod.image, prod.image];
          this.thumbsById.set(next);
        }
      });
      this.previewById.set(map);
    });
    // Précharge les images
    this.preloadService.preloadCollectionImages();
  }

  getPreview(product: Product): string {
    return this.previewById()[product.id] ?? product.image;
  }

  setPreview(productId: number, imgUrl: string): void {
    const current = this.previewById();
    this.previewById.set({ ...current, [productId]: imgUrl });
  }

  private normalizeColorName(name: string): string {
    return (name || '').toString().trim().toLowerCase();
  }

  resolveColorImage(colorName: string): string {
    const name = this.normalizeColorName(colorName);
    // Structure actuelle : assets/infos-T/2/[couleur].png (PNG) ou assets/infos-T/1/[couleur].jpg (JPG)
    // Priorité au PNG du dossier 2
    return `assets/infos-T/2/${name}.png`;
  }
  
  getColorImages(product: Product): string[] {
    const firstColor = product.colors?.[0]?.name;
    if (!firstColor) return [];
    return this.preloadService.getColorImages(firstColor);
  }

  onCheckboxChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const formArray = this.filterForm.get(controlName);
    if (formArray) {
      let currentValues: string[] = formArray.value || [];
      if (input.checked) {
        currentValues.push(input.value);
      } else {
        currentValues = currentValues.filter(val => val !== input.value);
      }
      formArray.setValue(currentValues);
    }
  }

  toggleFilter() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}

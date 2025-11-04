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
  // Thumbnails cargées automatiquement depuis src/app/infos-T/1 et 2
  collectionThumbnails: string[] = [];
  // Prévisualisation courante par produit (id -> url image)
  previewById = signal<Record<number, string>>({});
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
      data.forEach(prod => { map[prod.id] = prod.image; });
      this.previewById.set(map);
    });
    // Précharge les images
    this.preloadService.preloadCollectionImages();

    // Charge automatiquement les miniatures depuis src/app/infos-T/1 et /2 via webpack
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = (require as any).context(
        '../../app/infos-T',
        true,
        /\.(png|jpe?g|webp|gif|svg)$/i
      );
      const keys: string[] = req.keys();
      this.collectionThumbnails = keys
        .filter(k => /\/(1|2)\//.test(k))
        .map(k => req(k));
    } catch {
      this.collectionThumbnails = [];
    }
  }

  getPreview(product: Product): string {
    return this.previewById()[product.id] ?? product.image;
  }

  setPreview(productId: number, imgUrl: string): void {
    const current = this.previewById();
    this.previewById.set({ ...current, [productId]: imgUrl });
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

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
        const firstColor = prod.colors[0]?.name;
        if (firstColor) {
          // Image par défaut (structure actuelle)
          const defaultImg = this.resolveColorImage(firstColor);
          map[prod.id] = defaultImg;
          
          // Chercher les images disponibles de manière asynchrone
          this.preloadService.findColorThumbnails(firstColor, 6).then(imgs => {
            const next = { ...this.thumbsById() };
            if (imgs.length > 0) {
              // Cas spécial pour le produit beige : s'assurer que biege.png est la 3ème image
              const isBeige = this.normalizeColorName(firstColor) === 'beige' && prod.name.toLowerCase().includes('beige');
              
              if (isBeige) {
                // Pour beige, garantir que assets/biege.png est la 3ème vignette
                const biegeImage = 'assets/biege.png';
                let finalImages: string[] = [];
                
                if (imgs.length >= 3) {
                  // Si on a déjà 3+ images, remplacer la 3ème par biege.png si elle n'y est pas déjà
                  finalImages = imgs.slice(0, 2);
                  if (!imgs.includes(biegeImage)) {
                    finalImages.push(biegeImage);
                  } else {
                    // Si biege.png est déjà dans les images, garder les 3 premières
                    finalImages = imgs.slice(0, 3);
                  }
                } else if (imgs.length === 2) {
                  // Si seulement 2 images, ajouter biege.png comme 3ème
                  finalImages = [imgs[0], imgs[1], biegeImage];
                } else {
                  // Si 1 seule image, ajouter biege.png
                  finalImages = [imgs[0], imgs[0], biegeImage];
                }
                next[prod.id] = finalImages;
              } else {
                // Pour les autres produits, logique normale
                if (imgs.length >= 3) {
                  // Utiliser les 3 premières images trouvées (déjà uniques)
                  next[prod.id] = imgs.slice(0, 3);
                } else if (imgs.length === 2) {
                  // Si seulement 2 images trouvées, chercher une 3ème source différente
                  const altName = this.normalizeColorName(firstColor);
                  // Essayer plusieurs variantes pour trouver une 3ème image différente
                  const altPaths = [
                    `assets/infos-T/${altName}/3.png`,
                    `assets/infos-T/${altName}/3.jpg`,
                    `assets/infos-T/2/${altName}_3.png`,
                    `assets/infos-T/1/${altName}_3.jpg`,
                    `assets/infos-T/1/${altName}_3.png`,
                    `assets/infos-T/2/${altName}_3.jpg`,
                    `assets/infos-T/${altName}/2.png`, // Si 1.png et 3.png existent mais pas 2.png
                    `assets/infos-T/${altName}/1.png`,
                    `assets/infos-T/2/${altName}_2.png`,
                    `assets/infos-T/1/${altName}_2.jpg`,
                    `assets/infos-T/2/${altName}.jpg`, // Variante JPG si PNG déjà utilisé
                    `assets/infos-T/1/${altName}.png`, // Variante PNG si JPG déjà utilisé
                    imgs[1] // Fallback : utiliser la 2ème image (sera remplacée si une 3ème différente est trouvée)
                  ];
                  
                  // Chercher la première image disponible qui n'est pas déjà dans la liste
                  this.findFirstAvailableImage(altPaths, imgs).then(thirdImg => {
                    // Mettre à jour seulement si on a trouvé une image différente
                    if (thirdImg !== imgs[0] && thirdImg !== imgs[1]) {
                      const updated = { ...this.thumbsById() };
                      updated[prod.id] = [imgs[0], imgs[1], thirdImg];
                      this.thumbsById.set(updated);
                    }
                  });
                  
                  // Utiliser temporairement la 2ème image pour la 3ème (sera remplacée si une 3ème différente est trouvée)
                  next[prod.id] = [imgs[0], imgs[1], imgs[1]];
                } else {
                  // Si 1 seule image, répéter 3 fois
                  next[prod.id] = [imgs[0], imgs[0], imgs[0]];
                }
              }
              const preview = { ...this.previewById() };
              preview[prod.id] = imgs[0];
              this.previewById.set(preview);
            } else {
              // Fallback : utiliser l'image du produit répétée 3 fois
              // Cas spécial pour beige
              if (this.normalizeColorName(firstColor) === 'beige' && prod.name.toLowerCase().includes('beige')) {
                next[prod.id] = [prod.image, prod.image, 'assets/biege.png'];
              } else {
                next[prod.id] = [prod.image, prod.image, prod.image];
              }
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

  private findFirstAvailableImage(paths: string[], excludeUrls: string[]): Promise<string> {
    const excludeSet = new Set(excludeUrls);
    const checks = paths.map(path =>
      new Promise<string | null>((resolve) => {
        // Si le chemin est déjà dans les exclus, ignorer
        if (excludeSet.has(path)) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => resolve(path);
        img.onerror = () => resolve(null);
        img.src = path;
      })
    );
    return Promise.all(checks).then(results => {
      // Retourner la première image trouvée, ou le fallback (dernier élément de paths)
      return results.find(r => r !== null) || paths[paths.length - 1];
    });
  }

  resolveColorImage(colorName: string): string {
    const name = this.normalizeColorName(colorName);
    // Structure actuelle : assets/infos-T/2/[couleur].png (PNG) ou assets/infos-T/1/[couleur].jpg (JPG)
    // Priorité au PNG du dossier 2
    return `assets/infos-T/2/${name}.png`;
  }
  
  getColorImages(product: Product): string[] {
    const firstColor = product.colors[0]?.name;
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

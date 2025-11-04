import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreloadService {
  private colors = ['blanc', 'noir', 'beige', 'marron', 'gris'];

  preloadCollectionImages(): Promise<void> {
    const urls: string[] = [];
    // Précharger les 3 images par couleur depuis assets/infos-T/[couleur]/[1-3].png
    for (const c of this.colors) {
      urls.push(`assets/infos-T/${c}/1.png`);
      urls.push(`assets/infos-T/${c}/2.png`);
      urls.push(`assets/infos-T/${c}/3.png`);
    }
    return this.preloadImages(urls).then(() => void 0);
  }

  private preloadImages(urls: string[]): Promise<void[]> {
    const tasks = urls.map((url) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      })
    );
    return Promise.all(tasks);
  }

  findColorThumbnails(colorName: string, maxCount = 8): Promise<string[]> {
    const name = (colorName || '').toString().trim().toLowerCase();
    const candidates: string[] = [];
    
    // Priorité 1 : Structure par couleur (assets/infos-T/[couleur]/1.png, 2.png, 3.png)
    for (let i = 1; i <= 3; i++) {
      candidates.push(`assets/infos-T/${name}/${i}.png`);
      candidates.push(`assets/infos-T/${name}/${i}.jpg`);
    }
    
    // Priorité 2 : Structure actuelle (dossiers 1 et 2)
    // Utiliser les images existantes dans 1/[couleur].jpg et 2/[couleur].png
    candidates.push(`assets/infos-T/2/${name}.png`); // PNG du dossier 2
    candidates.push(`assets/infos-T/1/${name}.jpg`); // JPG du dossier 1
    
    // Si plusieurs images numérotées existent
    for (let i = 1; i <= 3; i++) {
      candidates.push(`assets/infos-T/1/${name}_${i}.jpg`);
      candidates.push(`assets/infos-T/2/${name}_${i}.png`);
    }
    
    // Fallbacks
    candidates.push(`assets/infos-T/1/${name}.png`);
    candidates.push(`assets/${name}.png`);

    return this.filterExistingImages(candidates);
  }
  
  getColorImages(colorName: string): string[] {
    const name = (colorName || '').toString().trim().toLowerCase();
    // Retourne les chemins possibles pour les 3 images
    // Priorité : structure par couleur, puis structure par dossier
    const images: string[] = [];
    
    // Structure par couleur (nouvelle) : assets/infos-T/[couleur]/1.png, 2.png, 3.png
    for (let i = 1; i <= 3; i++) {
      images.push(`assets/infos-T/${name}/${i}.png`);
    }
    
    // Structure actuelle : utiliser la même image du dossier 2 (PNG) pour les 3 vignettes
    // ou chercher des variantes dans les dossiers 1 et 2
    images.push(`assets/infos-T/2/${name}.png`);
    images.push(`assets/infos-T/1/${name}.jpg`);
    
    // Si plusieurs images numérotées
    for (let i = 1; i <= 3; i++) {
      images.push(`assets/infos-T/2/${name}_${i}.png`);
      images.push(`assets/infos-T/1/${name}_${i}.jpg`);
    }
    
    return images;
  }

  private filterExistingImages(urls: string[]): Promise<string[]> {
    const checks = urls.map(url =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      })
    );
    return Promise.all(checks).then(results => results.filter((u): u is string => !!u));
  }
}



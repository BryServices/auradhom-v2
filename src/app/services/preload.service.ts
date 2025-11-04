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
    
    // Charger les 3 images par couleur depuis assets/infos-T/[couleur]/1.png, 2.png, 3.png
    for (let i = 1; i <= 3; i++) {
      candidates.push(`assets/infos-T/${name}/${i}.png`);
      candidates.push(`assets/infos-T/${name}/${i}.jpg`);
    }
    
    // Fallbacks pour compatibilité
    for (let i = 1; i <= maxCount; i++) {
      candidates.push(`assets/infos-T/1/${name}_${i}.png`);
      candidates.push(`assets/infos-T/2/${name}_${i}.png`);
    }
    candidates.push(`assets/infos-T/1/${name}.png`);
    candidates.push(`assets/infos-T/2/${name}.png`);

    return this.filterExistingImages(candidates);
  }
  
  getColorImages(colorName: string): string[] {
    const name = (colorName || '').toString().trim().toLowerCase();
    // Retourne directement les 3 images attendues
    return [
      `assets/infos-T/${name}/1.png`,
      `assets/infos-T/${name}/2.png`,
      `assets/infos-T/${name}/3.png`
    ];
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



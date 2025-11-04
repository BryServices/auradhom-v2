import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreloadService {
  private colors = ['blanc', 'noir', 'beige', 'marron', 'gris'];

  preloadCollectionImages(): Promise<void> {
    const urls: string[] = [];
    // Dossier 1: .jpg
    for (const c of this.colors) {
      urls.push(`assets/infos-T/1/${c}.jpg`);
    }
    // Dossier 2: .png
    for (const c of this.colors) {
      urls.push(`assets/infos-T/2/${c}.png`);
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
    for (let i = 1; i <= maxCount; i++) {
      candidates.push(`assets/infos-T/1/${name}_${i}.png`);
      candidates.push(`assets/infos-T/2/${name}_${i}.png`);
    }
    // Also try unnumbered as a fallback
    candidates.push(`assets/infos-T/1/${name}.png`);
    candidates.push(`assets/infos-T/2/${name}.png`);

    return this.filterExistingImages(candidates);
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



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
}



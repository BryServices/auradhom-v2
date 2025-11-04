import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreloadService {
  private colors = ['blanc', 'noir', 'beige', 'marron', 'gris'];

  preloadCollectionImages(): Promise<void> {
    const urls: string[] = [];
    // Précharger les 3 images par couleur depuis assets/infos-T/[couleur]/[1-3].png
    // Priorité aux premières images visibles
    for (const c of this.colors) {
      urls.push(`assets/infos-T/${c}/1.png`);
      urls.push(`assets/infos-T/${c}/2.png`);
      urls.push(`assets/infos-T/${c}/3.png`);
    }
    // Précharger aussi les images de fallback
    for (const c of this.colors) {
      urls.push(`assets/infos-T/2/${c}.png`);
      urls.push(`assets/infos-T/1/${c}.jpg`);
    }
    return this.preloadImages(urls).then(() => void 0);
  }

  private preloadImages(urls: string[]): Promise<void[]> {
    // Charger par batch pour ne pas surcharger le navigateur
    const batchSize = 3;
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    const loadBatch = (batch: string[]): Promise<void[]> => {
      return Promise.all(
        batch.map((url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            // Utiliser fetchpriority pour les premières images
            if (batches.indexOf(batch) === 0 && batch.indexOf(url) === 0) {
              (img as any).fetchPriority = 'high';
            }
            img.src = url;
          })
        )
      );
    };

    // Charger les batches séquentiellement pour éviter la surcharge
    return batches.reduce(
      (promise, batch) => promise.then(() => loadBatch(batch)),
      Promise.resolve([] as void[])
    );
  }

  findColorThumbnails(colorName: string, maxCount = 8): Promise<string[]> {
    const name = (colorName || '').toString().trim().toLowerCase();
    const candidates: string[] = [];
    
    // Priorité 1 : Structure par couleur (assets/infos-T/[couleur]/1.png, 2.png, 3.png)
    // Cette structure est la plus prioritaire car elle garantit 3 images différentes
    for (let i = 1; i <= 3; i++) {
      candidates.push(`assets/infos-T/${name}/${i}.png`);
      candidates.push(`assets/infos-T/${name}/${i}.jpg`);
    }
    
    // Priorité 2 : Images numérotées dans les dossiers 1 et 2 (beige_1.jpg, beige_2.png, etc.)
    // Ces images sont généralement différentes
    for (let i = 1; i <= 3; i++) {
      candidates.push(`assets/infos-T/2/${name}_${i}.png`);
      candidates.push(`assets/infos-T/1/${name}_${i}.jpg`);
      candidates.push(`assets/infos-T/1/${name}_${i}.png`);
      candidates.push(`assets/infos-T/2/${name}_${i}.jpg`);
    }
    
    // Priorité 3 : Structure actuelle (dossiers 1 et 2) - seulement si pas déjà trouvé
    candidates.push(`assets/infos-T/2/${name}.png`); // PNG du dossier 2
    candidates.push(`assets/infos-T/1/${name}.jpg`); // JPG du dossier 1
    candidates.push(`assets/infos-T/1/${name}.png`);
    candidates.push(`assets/infos-T/2/${name}.jpg`);
    
    // Fallbacks
    candidates.push(`assets/${name}.png`);
    candidates.push(`assets/${name}.jpg`);
    
    // Cas spécial pour beige : ajouter biege.png (avec l'orthographe du fichier)
    if (name === 'beige') {
      candidates.push('assets/biege.png');
    }

    return this.filterExistingImages(candidates).then(urls => {
      // Supprimer les doublons en gardant l'ordre de priorité
      const unique: string[] = [];
      const seen = new Set<string>();
      for (const url of urls) {
        if (!seen.has(url)) {
          seen.add(url);
          unique.push(url);
        }
      }
      return unique.slice(0, maxCount);
    });
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



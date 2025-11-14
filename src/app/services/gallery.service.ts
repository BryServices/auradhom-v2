import { Injectable } from '@angular/core';

export interface GalleryImage {
  id: number;
  title?: string;
  alt?: string;
  url: string;
  thumb: string;
  category?: string;
  tags?: string[];
  views?: number;
  createdAt?: string;
  featured?: boolean;
}

export interface FetchResult {
  items: GalleryImage[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private data: GalleryImage[] = [];

  private categories = ['All', 'T-Shirts', 'Posters', 'Stickers', 'Artworks', 'Covers'];
  private tags = ['minimal', 'vintage', 'street', 'limited', 'promo', 'featured'];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Load images from the gallery folder
    // This array is manually updated when images are added/removed
    const imageFilenames = [
      '1.jpg',
      '2.jpg',
      '3.jpg',
      '4.jpg',
      '5.jpg',
      'cover2.jpg',
      'im1.png',
      'im2.jpeg',
      'img (1).jpeg',
      'img (2).jpeg',
      'img (4).jpeg',
      'img (5).jpeg',
      'img (6).jpeg',
      'img (7).jpeg',
      'img (8).jpeg',
      'p1.jpeg',
      'p2.jpeg',
      'p3.jpeg',
      'p4.jpeg',
      'T0.jpeg',
      'TS1.jpeg',
      'vvvv.jpg',
      'W1.jpeg',
      'W2.jpeg',
      'W3.png',
      'Y1.jpeg',
      'Y2.jpg'
    ];

    this.data = imageFilenames.map((filename, i) => {
      const id = i + 1;
      const imagePath = `/galery/${filename}`;

      // Categorize images by filename patterns
      let cat = 'Artworks';
      if (filename.startsWith('T') || filename.startsWith('img')) cat = 'T-Shirts';
      else if (filename.startsWith('P') || filename.startsWith('p')) cat = 'Posters';
      else if (filename.startsWith('S')) cat = 'Stickers';
      else if (filename.startsWith('cover') || filename.startsWith('Y')) cat = 'Covers';

      const item: GalleryImage = {
        id,
        title: `${cat} — ${filename}`,
        alt: `${cat} — ${filename}`,
        url: imagePath,
        thumb: imagePath,
        category: cat,
        tags: [this.tags[i % this.tags.length]],
        views: Math.floor(Math.random() * 5000),
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        featured: i % 7 === 0
      };
      return item;
    });
  }

  getCategories() {
    return this.categories;
  }

  fetch(page = 1, perPage = 24, opts?: { category?: string; tags?: string[]; q?: string; sort?: string }): FetchResult {
    let list = [...this.data];

    if (opts?.category && opts.category !== 'All') {
      list = list.filter(i => i.category === opts.category);
    }

    if (opts?.tags && opts.tags.length > 0) {
      list = list.filter(i => opts.tags!.some(t => i.tags?.includes(t)));
    }

    if (opts?.q) {
      const q = opts.q.toLowerCase();
      list = list.filter(i => (i.title || '').toLowerCase().includes(q) || (i.tags || []).some(t => t.includes(q)));
    }

    if (opts?.sort) {
      if (opts.sort === 'newest') {
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      } else if (opts.sort === 'most_viewed') {
        list.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (opts.sort === 'featured') {
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const items = list.slice(start, start + perPage);

    return { items, meta: { page, perPage, total, totalPages } };
  }
}

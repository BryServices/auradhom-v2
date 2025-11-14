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
  private data: GalleryImage[];

  private categories = ['All', 'T-Shirts', 'Posters', 'Stickers', 'Artworks'];
  private tags = ['minimal', 'vintage', 'street', 'limited', 'promo'];

  constructor() {
    // generate mock data using picsum (fallback) — real project should use API
    this.data = Array.from({ length: 72 }).map((_, i) => {
      const id = i + 1;
      const width = 1200;
      const height = 1200;
      const seed = 1000 + id;
      const cat = this.categories[(i % (this.categories.length - 1)) + 1];
      const item: GalleryImage = {
        id,
        title: `${cat} #${id}`,
        alt: `${cat} image ${id}`,
        url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        thumb: `https://picsum.photos/seed/${seed}/600/600`,
        category: cat,
        tags: [this.tags[i % this.tags.length]],
        views: Math.floor(Math.random() * 5000),
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        featured: i % 11 === 0
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

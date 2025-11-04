import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

const STORAGE_KEY = 'auradhom_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.readFromStorage());

  total = computed(() => this.items().reduce((sum, it) => sum + it.price * it.quantity, 0));
  count = computed(() => this.items().reduce((sum, it) => sum + it.quantity, 0));

  getItems() { return this.items; }

  add(item: CartItem) {
    const items = [...this.items()];
    const idx = items.findIndex(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
    } else {
      items.push(item);
    }
    this.items.set(items);
    this.writeToStorage();
  }

  remove(index: number) {
    const items = [...this.items()];
    items.splice(index, 1);
    this.items.set(items);
    this.writeToStorage();
  }

  clear() {
    this.items.set([]);
    this.writeToStorage();
  }

  private readFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {}
  }
}



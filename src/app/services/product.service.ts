import { Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import { Product } from '../models/product';

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'T-shirt Blanc',
    slug: 't-shirt-blanc',
    price: 12000,
    description: 'Coton 180 g/m². Coupe droite. Essentiel.',
    image: 'assets/blanc.png',
    gallery: ['assets/blanc.png'],
    details: { composition: '100% Coton', maintenance: 'Lavage à 30°.', origin: 'Sénégal' },
    type: 'T-shirt',
    material: 'Coton lourd',
    colors: [{ name: 'Blanc', hex: '#FFFFFF' }],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'T-shirt Noir',
    slug: 't-shirt-noir',
    price: 12000,
    description: 'Coton 180 g/m². Coupe droite. Essentiel.',
    image: 'assets/noir.png',
    gallery: ['assets/noir.png'],
    details: { composition: '100% Coton', maintenance: 'Lavage à 30°.', origin: 'Sénégal' },
    type: 'T-shirt',
    material: 'Coton lourd',
    colors: [{ name: 'Noir', hex: '#000000' }],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 3,
    name: 'T-shirt Beige',
    slug: 't-shirt-beige',
    price: 12000,
    description: 'Coton 180 g/m². Coupe droite. Essentiel.',
    image: 'assets/biege.png',
    gallery: ['assets/biege.png'],
    details: { composition: '100% Coton', maintenance: 'Lavage à 30°.', origin: 'Sénégal' },
    type: 'T-shirt',
    material: 'Coton lourd',
    colors: [{ name: 'Beige', hex: '#D8D2C9' }],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'T-shirt Marron',
    slug: 't-shirt-marron',
    price: 12000,
    description: 'Coton 180 g/m². Coupe droite. Essentiel.',
    image: 'assets/marron.png',
    gallery: ['assets/marron.png'],
    details: { composition: '100% Coton', maintenance: 'Lavage à 30°.', origin: 'Sénégal' },
    type: 'T-shirt',
    material: 'Coton lourd',
    colors: [{ name: 'Marron', hex: '#6B4423' }],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 5,
    name: 'T-shirt Gris',
    slug: 't-shirt-gris',
    price: 12000,
    description: 'Coton 180 g/m². Coupe droite. Essentiel.',
    image: 'assets/gris.png',
    gallery: ['assets/gris.png'],
    details: { composition: '100% Coton', maintenance: 'Lavage à 30°.', origin: 'Sénégal' },
    type: 'T-shirt',
    material: 'Coton lourd',
    colors: [{ name: 'Gris', hex: '#808080' }],
    sizes: ['S', 'M', 'L', 'XL']
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>(PRODUCTS);

  getProducts() {
    return of(this.products());
  }

  getProductBySlug(slug: string) {
    const product = this.products().find(p => p.slug === slug);
    return of(product);
  }

  getFilterOptions() {
    return {
      silhouette: ['S', 'M', 'L', 'XL'],
      type: ['T-shirt'],
      matiere: ['Coton lourd'],
      teinte: ['Noir', 'Blanc', 'Beige', 'Marron', 'Gris']
    };
  }
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string;
  gallery: string[];
  details: {
    composition: string;
    maintenance: string;
    origin: string;
  };
  stock?: number;
  type: 'T-shirt' | 'Hoodie' | 'Pantalon' | 'Surchemise' | 'Casquette';
  material: 'Coton lourd' | 'Laine' | 'Cuir végétal';
  colors: { name: string; hex: string }[];
  sizes: string[];
}

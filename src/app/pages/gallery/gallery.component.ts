import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryService, GalleryImage } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  categories: string[] = [];
  images: GalleryImage[] = [];
  page = 1;
  perPage = 24;
  total = 0;
  totalPages = 1;

  // filters
  q = '';
  category = 'All';
  sort: 'newest' | 'most_viewed' | 'featured' = 'newest';

  // lightbox
  lightboxOpen = false;
  currentIndex = 0;

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.categories = this.galleryService.getCategories();
    this.load();
    
    // Debug: log image paths
    const res = this.galleryService.fetch(1, 5);
    console.log('Gallery Debug - First 5 images:');
    res.items.forEach(img => {
      console.log(`  ${img.title} → ${img.url}`);
    });
  }

  load(reset = true) {
    if (reset) this.page = 1;
    const res = this.galleryService.fetch(this.page, this.perPage, { category: this.category, q: this.q, sort: this.sort });
    this.total = res.meta.total;
    this.totalPages = res.meta.totalPages;
    if (reset) {
      this.images = res.items;
    } else {
      this.images = [...this.images, ...res.items];
    }
  }

  onSearch() {
    // simple search (debounce could be added)
    this.load(true);
  }

  changeCategory(cat: string) {
    this.category = cat;
    this.load(true);
  }

  changeSort(s: 'newest' | 'most_viewed' | 'featured') {
    this.sort = s;
    this.load(true);
  }

  resetFilters() {
    this.q = '';
    this.category = 'All';
    this.sort = 'newest';
    this.load(true);
  }

  loadMore() {
    if (this.page < this.totalPages) {
      this.page += 1;
      this.load(false);
    }
  }

  openLightbox(index: number) {
    this.currentIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
}

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'collection',
    loadComponent: () => import('./pages/collection/collection.component').then(c => c.CollectionComponent)
  },
  {
    path: 'produit/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
  },
  {
    path: 'panier',
    loadComponent: () => import('./pages/cart/cart.component').then(c => c.CartComponent)
  },
  {
    path: 'envoye',
    loadComponent: () => import('./pages/confirmation/confirmation.component').then(c => c.ConfirmationComponent)
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./pages/about/about.component').then(c => c.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(c => c.ContactComponent)
  },
  {
    path: 'infos-livraison',
    loadComponent: () => import('./pages/customer-info/customer-info.component').then(c => c.CustomerInfoComponent)
  },
  {
    path: 'customer-info',
    loadComponent: () => import('./pages/customer-info/customer-info.component').then(c => c.CustomerInfoComponent)
  },
  // Routes Admin
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/admin-login.component').then(c => c.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard/orders/:id',
    loadComponent: () => import('./pages/admin/order-detail/order-detail.component').then(c => c.OrderDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/products-list/products-list.component').then(c => c.ProductsListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products/new',
    loadComponent: () => import('./pages/admin/products/product-form/product-form.component').then(c => c.ProductFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products/:id',
    loadComponent: () => import('./pages/admin/products/product-detail/product-detail.component').then(c => c.ProductDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products/:id/edit',
    loadComponent: () => import('./pages/admin/products/product-form/product-form.component').then(c => c.ProductFormComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

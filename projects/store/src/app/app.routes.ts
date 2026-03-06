import { Routes } from '@angular/router';
import { StoreLayout } from './layout/store-layout/store-layout';

export const routes: Routes = [
  {
    path: '',
    component: StoreLayout,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products').then((m) => m.Products),
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];

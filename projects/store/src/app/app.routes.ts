import { Routes } from '@angular/router';
import { StoreLayout } from './layout/store-layout/store-layout';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.Signup),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password/:token',
        loadComponent: () =>
          import('./pages/auth/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
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
        loadComponent: () =>
          import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];

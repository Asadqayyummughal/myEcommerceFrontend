import { Routes } from '@angular/router';
import { vendorGuard } from './guards/vendor.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'apply', loadComponent: () => import('./pages/apply/apply').then((m) => m.Apply) },
  {
    path: 'pending',
    loadComponent: () => import('./pages/pending/pending').then((m) => m.Pending),
  },
  {
    path: '',
    canActivate: [vendorGuard],
    loadComponent: () => import('./layout/vendor-layout/vendor-layout').then((m) => m.VendorLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      { path: 'store', loadComponent: () => import('./pages/store/store').then((m) => m.Store) },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products').then((m) => m.Products),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./pages/products/create-product/create-product').then((m) => m.CreateProduct),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
      },
      {
        path: 'wallet',
        loadComponent: () => import('./pages/wallet/wallet').then((m) => m.Wallet),
      },
      {
        path: 'payouts',
        loadComponent: () => import('./pages/payouts/payouts').then((m) => m.Payouts),
      },
      {
        path: 'stripe',
        loadComponent: () => import('./pages/stripe/stripe-onboard').then((m) => m.StripeOnboard),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

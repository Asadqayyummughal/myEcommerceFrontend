import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'products', loadComponent: () => import('./pages/products/products').then(m => m.Products) },
      { path: 'orders', loadComponent: () => import('./pages/orders/orders').then(m => m.Orders) },
      { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.Users) },
      { path: 'categories', loadComponent: () => import('./pages/categories/categories').then(m => m.Categories) },
      { path: 'coupons',        loadComponent: () => import('./pages/coupons/coupons').then(m => m.Coupons) },
      { path: 'vendors',        loadComponent: () => import('./pages/vendors/vendors').then(m => m.Vendors) },
      { path: 'shipments',      loadComponent: () => import('./pages/shipments/shipments').then(m => m.Shipments) },
      { path: 'notifications',  loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications) },
      { path: 'roles',          loadComponent: () => import('./pages/roles/roles').then(m => m.Roles) },
    ]
  },
  { path: '**', redirectTo: '' }
];

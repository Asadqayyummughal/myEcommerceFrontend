import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
})
export class AdminSidebar {
  readonly collapsed = input(false);

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard',       route: '/dashboard' },
    { label: 'Products',      icon: 'inventory_2',     route: '/products' },
    { label: 'Orders',        icon: 'receipt_long',    route: '/orders' },
    { label: 'Users',         icon: 'people',          route: '/users' },
    { label: 'Vendors',       icon: 'store',           route: '/vendors' },
    { label: 'Stores',        icon: 'storefront',      route: '/stores' },
    { label: 'Categories',    icon: 'category',        route: '/categories' },
    { label: 'Coupons',       icon: 'local_offer',     route: '/coupons' },
    { label: 'Shipments',     icon: 'local_shipping',  route: '/shipments' },
    { label: 'Notifications', icon: 'notifications',   route: '/notifications' },
    { label: 'Roles & Perms', icon: 'manage_accounts', route: '/roles' },
  ];
}

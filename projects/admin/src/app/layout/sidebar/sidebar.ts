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
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/products' },
    { label: 'Orders', icon: 'receipt_long', route: '/orders' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Categories', icon: 'category', route: '/categories' },
    { label: 'Coupons', icon: 'local_offer', route: '/coupons' },
  ];
}

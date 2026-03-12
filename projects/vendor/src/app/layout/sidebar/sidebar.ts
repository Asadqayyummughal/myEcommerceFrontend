import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-vendor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
})
export class VendorSidebar {
  readonly collapsed = input(false);
  readonly closeMobile = output<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',              route: '/dashboard' },
    { label: 'My Store',     icon: 'storefront',             route: '/store' },
    { label: 'Analytics',    icon: 'bar_chart',              route: '/store/analytics' },
    { label: 'Products',     icon: 'inventory_2',            route: '/products' },
    { label: 'Orders',       icon: 'receipt_long',           route: '/orders' },
    { label: 'Wallet',       icon: 'account_balance_wallet', route: '/wallet' },
    { label: 'Payouts',      icon: 'payments',               route: '/payouts' },
    { label: 'Stripe Setup', icon: 'credit_score',           route: '/stripe' },
  ];
}

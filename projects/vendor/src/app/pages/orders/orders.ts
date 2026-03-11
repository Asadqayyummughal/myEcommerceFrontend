import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  loading = true;
  orders: any[] = [];
  filtered: any[] = [];
  selectedTab = 'all';

  tabs = [
    { label: 'All',        value: 'all' },
    { label: 'Pending',    value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped',    value: 'shipped' },
    { label: 'Delivered',  value: 'delivered' },
    { label: 'Cancelled',  value: 'cancelled' },
  ];

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.vendorService.getMyStore().subscribe({
      next: (res: any) => {
        const store = res.data ?? res;
        if (store?._id) {
          this.vendorService.getStoreOrders(store._id).subscribe({
            next: (r: any) => {
              this.orders = r.data?.orders ?? r.data ?? r.orders ?? [];
              this.filter();
              this.loading = false;
            },
            error: () => { this.loading = false; },
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
    });
  }

  setTab(tab: string): void {
    this.selectedTab = tab;
    this.filter();
  }

  filter(): void {
    this.filtered = this.selectedTab === 'all'
      ? this.orders
      : this.orders.filter(o => o.status?.toLowerCase() === this.selectedTab);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      shipped:    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      delivered:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}

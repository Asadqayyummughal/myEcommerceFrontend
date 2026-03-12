import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-store-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './store-analytics.html',
})
export class StoreAnalytics implements OnInit {
  loading = true;
  analytics: any = null;
  store: any = null;
  error = '';

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.vendorService.getMyStore().subscribe({
      next: (res: any) => {
        this.store = res.data ?? res;
        if (this.store?._id) {
          this.loadAnalytics(this.store._id);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Failed to load store.';
        this.loading = false;
      },
    });
  }

  private loadAnalytics(storeId: string): void {
    this.vendorService.getStoreAnalytics(storeId).subscribe({
      next: (res: any) => {
        this.analytics = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load analytics.';
        this.loading = false;
      },
    });
  }

  get statCards() {
    const a = this.analytics;
    return [
      { label: 'Total Revenue',    value: '$' + (a?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: 'attach_money',   color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
      { label: 'Total Orders',     value: (a?.totalOrders ?? 0).toLocaleString(),       icon: 'receipt_long',    color: 'text-indigo-600',  bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
      { label: 'Avg Order Value',  value: '$' + (a?.avgOrderValue ?? 0).toFixed(2),     icon: 'trending_up',     color: 'text-violet-600',  bg: 'bg-violet-100 dark:bg-violet-900/30' },
      { label: 'Total Products',   value: (a?.totalProducts ?? 0).toLocaleString(),     icon: 'inventory_2',     color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
      { label: 'Pending Orders',   value: (a?.pendingOrders ?? 0).toLocaleString(),     icon: 'hourglass_empty', color: 'text-orange-600',  bg: 'bg-orange-100 dark:bg-orange-900/30' },
      { label: 'Delivered Orders', value: (a?.deliveredOrders ?? 0).toLocaleString(),   icon: 'check_circle',    color: 'text-teal-600',    bg: 'bg-teal-100 dark:bg-teal-900/30' },
    ];
  }
}

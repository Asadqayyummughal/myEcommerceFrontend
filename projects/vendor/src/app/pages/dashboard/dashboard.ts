import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  gradient: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  loading = true;
  stats: StatCard[] = [];
  recentOrders: any[] = [];
  store: any = null;
  wallet: any = null;

  constructor(
    private vendorService: VendorService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadStore();
  }

  loadStore(): void {
    this.vendorService.getMyStore().subscribe({
      next: (res: any) => {
        this.store = res.data ?? res;
        if (this.store?._id) {
          this.loadAnalytics(this.store._id);
          this.loadOrders(this.store._id);
        } else {
          this.loading = false;
        }
        this.loadWallet();
      },
      error: () => {
        this.loading = false;
        this.buildStats(null, null);
      },
    });
  }

  loadAnalytics(storeId: string): void {
    this.vendorService.getStoreAnalytics(storeId).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.buildStats(d, this.wallet);
        this.loading = false;
      },
      error: () => {
        this.buildStats(null, this.wallet);
        this.loading = false;
      },
    });
  }

  loadWallet(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.vendorService.getWallet(userId).subscribe({
      next: (res: any) => {
        this.wallet = res.data ?? res;
      },
      error: () => {},
    });
  }

  loadOrders(vendorId: string): void {
    this.vendorService.getStoreOrders(vendorId).subscribe({
      next: (res: any) => {
        this.recentOrders = (res.data?.orders ?? res.data ?? res.orders ?? []).slice(0, 6);
      },
      error: () => (this.recentOrders = []),
    });
  }

  buildStats(analytics: any, wallet: any): void {
    this.stats = [
      {
        label: 'Wallet Balance',
        value: '$' + ((wallet?.balance ?? 0) / 100).toFixed(2),
        icon: 'account_balance_wallet',
        color: 'text-indigo-600',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        gradient: 'from-indigo-500 to-indigo-600',
      },
      {
        label: 'Total Revenue',
        value: '$' + (analytics?.totalRevenue ?? 0).toLocaleString(),
        icon: 'attach_money',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        gradient: 'from-emerald-500 to-emerald-600',
      },
      {
        label: 'Total Orders',
        value: (analytics?.totalOrders ?? 0).toLocaleString(),
        icon: 'receipt_long',
        color: 'text-violet-600',
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        gradient: 'from-violet-500 to-violet-600',
      },
      {
        label: 'Avg Order Value',
        value: '$' + (analytics?.avgOrderValue ?? 0).toFixed(2),
        icon: 'trending_up',
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        gradient: 'from-amber-500 to-amber-600',
      },
    ];
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

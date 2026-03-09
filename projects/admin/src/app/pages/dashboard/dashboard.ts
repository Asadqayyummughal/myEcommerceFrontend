import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  change: string;
  changePositive: boolean;
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
  topProducts: any[] = [];

  readonly apiUrl = 'http://localhost:3000';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecentOrders();
  }

  loadDashboard(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.stats = [
          {
            label: 'Total Revenue',
            value: '$' + (d.totalRevenue ?? 0).toLocaleString(),
            icon: 'attach_money',
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            change: '+12.5%',
            changePositive: true,
          },
          {
            label: 'Total Orders',
            value: (d.totalOrders ?? 0).toLocaleString(),
            icon: 'receipt_long',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            change: '+8.2%',
            changePositive: true,
          },
          {
            label: 'Total Products',
            value: (d.totalProducts ?? 0).toLocaleString(),
            icon: 'inventory_2',
            color: 'text-violet-600',
            bg: 'bg-violet-100',
            change: '+3.1%',
            changePositive: true,
          },
          {
            label: 'Total Users',
            value: (d.totalUsers ?? 0).toLocaleString(),
            icon: 'people',
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            change: '+5.7%',
            changePositive: true,
          },
        ];
        this.topProducts = d.topProducts ?? [];
        this.loading = false;
      },
      error: () => {
        // Fallback mock stats if endpoint not available
        this.stats = [
          { label: 'Total Revenue', value: '$0', icon: 'attach_money', color: 'text-emerald-600', bg: 'bg-emerald-100', change: '—', changePositive: true },
          { label: 'Total Orders', value: '0', icon: 'receipt_long', color: 'text-blue-600', bg: 'bg-blue-100', change: '—', changePositive: true },
          { label: 'Total Products', value: '0', icon: 'inventory_2', color: 'text-violet-600', bg: 'bg-violet-100', change: '—', changePositive: true },
          { label: 'Total Users', value: '0', icon: 'people', color: 'text-amber-600', bg: 'bg-amber-100', change: '—', changePositive: true },
        ];
        this.loading = false;
      },
    });
  }

  loadRecentOrders(): void {
    this.adminService.getOrders({ limit: 8 }).subscribe({
      next: (res: any) => {
        this.recentOrders = (res.data?.items ?? res.data ?? res.orders ?? []).slice(0, 8);
      },
      error: () => (this.recentOrders = []),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-violet-100 text-violet-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }
}

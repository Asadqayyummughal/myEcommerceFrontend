import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  orders: any[] = [];
  loading = true;
  selectedTab: OrderStatus | 'all' = 'all';
  updatingId: string | null = null;
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  readonly tabs: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  readonly statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const params: any = { page: this.currentPage, limit: this.pageSize };
    if (this.selectedTab !== 'all') params['status'] = this.selectedTab;
    if (this.searchQuery) params['q'] = this.searchQuery;
    this.adminService.getOrders(params).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.orders = d.items ?? d.orders ?? d ?? [];
        this.total = d.meta?.total ?? this.orders.length;
        this.totalPages = d.meta?.pages ?? Math.ceil(this.total / this.pageSize);
        this.loading = false;
      },
      error: () => { this.orders = []; this.loading = false; },
    });
  }

  setTab(tab: OrderStatus | 'all'): void {
    this.selectedTab = tab;
    this.currentPage = 1;
    this.loadOrders();
  }

  updateStatus(order: any, status: OrderStatus): void {
    this.updatingId = order._id;
    this.adminService.updateOrderStatus(order._id, status).subscribe({
      next: () => {
        order.status = status;
        this.updatingId = null;
        this.snackBar.open(`Order updated to ${status}`, '✓', { duration: 2000 });
      },
      error: () => {
        this.updatingId = null;
        this.snackBar.open('Failed to update order', 'Close', { duration: 2000 });
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }

  get pageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }
}

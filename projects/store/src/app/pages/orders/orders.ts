import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '@core/services/order.service';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
}

export interface Order {
  _id: string;
  status: OrderStatus;
  paymentMethod: 'stripe' | 'cod';
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

type FilterTab = 'all' | OrderStatus;

interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  orders: Order[] = [];
  loading = true;
  activeTab: FilterTab = 'all';
  expandedOrderId: string | null = null;
  readonly apiUrl = 'http://localhost:3000';

  // ── Pagination ─────────────────────────────────────
  currentPage = 1;
  readonly pageSize = 5;

  // ── Track Order ────────────────────────────────────
  trackingOrder: Order | null = null;
  trackingLoading = false;

  readonly tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  readonly trackingSteps: TrackingStep[] = [
    { status: 'pending', label: 'Order Placed', description: 'Your order has been received', icon: 'receipt_long' },
    { status: 'processing', label: 'Processing', description: 'Vendor is preparing your items', icon: 'inventory_2' },
    { status: 'shipped', label: 'Shipped', description: 'Your order is on its way', icon: 'local_shipping' },
    { status: 'delivered', label: 'Delivered', description: 'Package delivered successfully', icon: 'check_circle' },
  ];

  private readonly statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res: any) => {
        this.orders = res.data ?? res ?? [];
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Could not load orders. Please try again.', 'Close', { duration: 4000 });
        this.loading = false;
      },
    });
  }

  // ── Filters ────────────────────────────────────────
  get filteredOrders(): Order[] {
    if (this.activeTab === 'all') return this.orders;
    return this.orders.filter((o) => o.status === this.activeTab);
  }

  setTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.expandedOrderId = null;
  }

  // ── Pagination ─────────────────────────────────────
  get pagedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    // Show first, last, current ±1, with ellipsis gaps
    const pages = new Set([1, total, this.currentPage, this.currentPage - 1, this.currentPage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.expandedOrderId = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Order Detail Expand ────────────────────────────
  toggleExpand(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  // ── Track Order ────────────────────────────────────
  openTracking(order: Order): void {
    this.trackingOrder = order;
    this.trackingLoading = true;
    this.orderService.trackOrder(order._id).subscribe({
      next: (res: any) => {
        this.trackingOrder = res.data ?? order;
        this.trackingLoading = false;
      },
      error: () => {
        // Fall back to local data if API fails
        this.trackingLoading = false;
      },
    });
  }

  closeTracking(): void {
    this.trackingOrder = null;
  }

  isStepCompleted(stepStatus: OrderStatus, orderStatus: OrderStatus): boolean {
    if (orderStatus === 'cancelled') return false;
    return this.statusOrder.indexOf(orderStatus) >= this.statusOrder.indexOf(stepStatus);
  }

  isStepCurrent(stepStatus: OrderStatus, orderStatus: OrderStatus): boolean {
    return stepStatus === orderStatus;
  }

  // ── Stats ──────────────────────────────────────────
  get totalSpent(): number {
    return this.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }

  get deliveredCount(): number {
    return this.orders.filter((o) => o.status === 'delivered').length;
  }

  tabCount(tab: FilterTab): number {
    if (tab === 'all') return this.orders.length;
    return this.orders.filter((o) => o.status === tab).length;
  }

  // ── Status helpers ─────────────────────────────────
  statusConfig(status: OrderStatus): { label: string; classes: string; icon: string } {
    const map: Record<OrderStatus, { label: string; classes: string; icon: string }> = {
      pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'schedule' },
      processing: { label: 'Processing', classes: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'autorenew' },
      shipped: { label: 'Shipped', classes: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'local_shipping' },
      delivered: { label: 'Delivered', classes: 'bg-green-50 text-green-700 border-green-200', icon: 'check_circle' },
      cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border-red-200', icon: 'cancel' },
    };
    return map[status] ?? map['pending'];
  }

  paymentStatusConfig(status: PaymentStatus): { label: string; classes: string } {
    const map: Record<PaymentStatus, { label: string; classes: string }> = {
      pending: { label: 'Payment Pending', classes: 'text-amber-600' },
      paid: { label: 'Paid', classes: 'text-green-600' },
      failed: { label: 'Payment Failed', classes: 'text-red-600' },
    };
    return map[status] ?? map['pending'];
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }

  trackByOrder(_: number, o: Order): string {
    return o._id;
  }
}

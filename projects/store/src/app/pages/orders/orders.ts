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

  readonly tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

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

  get filteredOrders(): Order[] {
    if (this.activeTab === 'all') return this.orders;
    return this.orders.filter((o) => o.status === this.activeTab);
  }

  get totalSpent(): number {
    return this.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }

  get deliveredCount(): number {
    return this.orders.filter((o) => o.status === 'delivered').length;
  }

  get pendingCount(): number {
    return this.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  }

  tabCount(tab: FilterTab): number {
    if (tab === 'all') return this.orders.length;
    return this.orders.filter((o) => o.status === tab).length;
  }

  toggleExpand(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }

  statusConfig(status: OrderStatus): { label: string; classes: string; icon: string } {
    const map: Record<OrderStatus, { label: string; classes: string; icon: string }> = {
      pending: {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: 'schedule',
      },
      processing: {
        label: 'Processing',
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: 'autorenew',
      },
      shipped: {
        label: 'Shipped',
        classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: 'local_shipping',
      },
      delivered: {
        label: 'Delivered',
        classes: 'bg-green-50 text-green-700 border-green-200',
        icon: 'check_circle',
      },
      cancelled: {
        label: 'Cancelled',
        classes: 'bg-red-50 text-red-700 border-red-200',
        icon: 'cancel',
      },
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

  trackByOrder(_: number, o: Order): string {
    return o._id;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VendorService } from '../../../services/vendor.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './order-detail.html',
})
export class OrderDetail implements OnInit {
  loading = true;
  order: any = null;
  error = '';
  readonly apiUrl = 'http://localhost:3000/';

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id') ?? '';
    this.vendorService.getOrderDetail(orderId).subscribe({
      next: (res: any) => {
        this.order = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load order details.';
        this.loading = false;
      },
    });
  }

  imageUrl(img: string): string {
    if (!img) return '';
    return img.startsWith('http') ? img : `${this.apiUrl}${img}`;
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

  get vendorItems(): any[] {
    if (!this.order?.items) return [];
    const vendorId = this.authService.currentUser?.id ?? '';
    // filter to only this vendor's items if store info is present
    return this.order.items.filter((item: any) =>
      !item.vendor || item.vendor === vendorId || item.vendor?._id === vendorId
    );
  }

  get vendorTotal(): number {
    return this.order?.vendorTotal ?? this.vendorItems.reduce(
      (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0
    );
  }
}

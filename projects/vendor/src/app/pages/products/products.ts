import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  loading = true;
  products: any[] = [];
  storeId = '';
  readonly apiUrl = 'http://localhost:3000';

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.vendorService.getMyStore().subscribe({
      next: (res: any) => {
        const store = res.data ?? res;
        this.storeId = store?._id ?? '';
        if (this.storeId) {
          this.loadProducts();
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
    });
  }

  loadProducts(): void {
    this.vendorService.getStoreProducts(this.storeId).subscribe({
      next: (res: any) => {
        this.products = res.data?.products ?? res.data ?? res.products ?? [];
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      },
    });
  }

  imageUrl(img: string): string {
    if (!img) return '';
    return img.startsWith('http') ? img : `${this.apiUrl}/${img}`;
  }

  deleteProduct(id: string, title: string): void {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    this.vendorService.deleteProduct(id).subscribe({
      next: () => { this.products = this.products.filter(p => p._id !== id); },
      error: () => { alert('Failed to delete product. Please try again.'); },
    });
  }
}

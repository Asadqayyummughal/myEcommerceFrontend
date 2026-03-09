import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { Product } from '@models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  products: Product[] = [];
  loading = true;
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  total = 0;
  readonly apiUrl = 'http://localhost:3000';

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getProducts({ page: this.currentPage, limit: this.pageSize, q: this.searchQuery || undefined }).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.products = d.items ?? d.products ?? d ?? [];
        this.total = d.meta?.total ?? this.products.length;
        this.totalPages = d.meta?.pages ?? Math.ceil(this.total / this.pageSize);
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  toggleStatus(product: Product): void {
    this.adminService.toggleProductStatus(product._id, !product.isActive).subscribe({
      next: () => {
        product.isActive = !product.isActive;
        this.snackBar.open(`Product ${product.isActive ? 'activated' : 'deactivated'}`, '✓', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 2000 }),
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    this.adminService.deleteProduct(product._id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== product._id);
        this.snackBar.open('Product deleted', '✓', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to delete product', 'Close', { duration: 2000 }),
    });
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

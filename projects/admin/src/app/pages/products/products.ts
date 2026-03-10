import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { Product } from '@models/product.model';

interface ProductForm {
  title: string;
  description: string;
  price: number | null;
  salePrice: number | null;
  stock: number | null;
  sku: string;
  brand: string;
  tags: string;
  isActive: boolean;
}

interface ImagePreview {
  file: File | null;   // null = existing remote image
  previewUrl: string;  // blob URL or server path
  isExisting: boolean;
}

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

  // modal state
  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  uploadingImages = false;
  form: ProductForm = this.emptyForm();

  // image state
  imagePreviews: ImagePreview[] = [];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.loadProducts(); }

  private emptyForm(): ProductForm {
    return { title: '', description: '', price: null, salePrice: null, stock: null, sku: '', brand: '', tags: '', isActive: true };
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
      error: () => { this.products = []; this.loading = false; },
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadProducts(); }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  // ── Modal ────────────────────────────────────────────
  openCreate(): void {
    this.editingProduct = null;
    this.form = this.emptyForm();
    this.imagePreviews = [];
    this.showModal = true;
  }

  openEdit(product: Product): void {
    this.editingProduct = product;
    this.form = {
      title:       product.title ?? '',
      description: product.description ?? '',
      price:       product.price ?? null,
      salePrice:   product.salePrice ?? null,
      stock:       product.stock ?? null,
      sku:         product.sku ?? '',
      brand:       product.brand ?? '',
      tags:        (product.tags ?? []).join(', '),
      isActive:    product.isActive ?? true,
    };
    // Load existing images as previews
    this.imagePreviews = (product.images ?? []).map(path => ({
      file: null,
      previewUrl: path.startsWith('http') ? path : this.apiUrl + path,
      isExisting: true,
    }));
    this.showModal = true;
  }

  closeModal(): void {
    // revoke blob URLs to prevent memory leaks
    this.imagePreviews.filter(p => !p.isExisting).forEach(p => URL.revokeObjectURL(p.previewUrl));
    this.showModal = false;
  }

  // ── Image handling ────────────────────────────────────
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      this.imagePreviews.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
      });
    });
    input.value = ''; // reset so same file can be re-selected
  }

  removeImage(index: number): void {
    const preview = this.imagePreviews[index];
    if (!preview.isExisting) URL.revokeObjectURL(preview.previewUrl);
    this.imagePreviews.splice(index, 1);
  }

  // ── Save ──────────────────────────────────────────────
  save(): void {
    if (!this.form.title.trim() || this.form.price === null || this.form.stock === null) {
      this.snackBar.open('Title, price and stock are required', 'Close', { duration: 2500 });
      return;
    }
    this.saving = true;

    const newFiles = this.imagePreviews.filter(p => !p.isExisting).map(p => p.file!);
    const existingPaths = this.imagePreviews
      .filter(p => p.isExisting)
      .map(p => {
        // strip apiUrl prefix to store relative path
        return p.previewUrl.startsWith(this.apiUrl) ? p.previewUrl.slice(this.apiUrl.length) : p.previewUrl;
      });

    const uploadAndSave = (uploadedUrls: string[]) => {
      const payload = {
        ...this.form,
        price:     Number(this.form.price),
        salePrice: this.form.salePrice ? Number(this.form.salePrice) : undefined,
        stock:     Number(this.form.stock),
        tags:      this.form.tags ? this.form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images:    [...existingPaths, ...uploadedUrls],
      };

      const call = this.editingProduct
        ? this.adminService.updateProduct(this.editingProduct._id, payload)
        : this.adminService.createProduct(payload);

      call.subscribe({
        next: () => {
          this.snackBar.open(this.editingProduct ? 'Product updated' : 'Product created', '✓', { duration: 2000 });
          this.saving = false;
          this.showModal = false;
          this.loadProducts();
        },
        error: (err: any) => {
          this.snackBar.open(err?.error?.message ?? 'Failed to save product', 'Close', { duration: 2500 });
          this.saving = false;
        },
      });
    };

    if (newFiles.length > 0) {
      this.uploadingImages = true;
      this.adminService.uploadImages(newFiles).subscribe({
        next: (res: any) => {
          this.uploadingImages = false;
          const uploaded: string[] = res.data?.urls ?? res.urls ?? res.data ?? [];
          uploadAndSave(Array.isArray(uploaded) ? uploaded : [uploaded]);
        },
        error: (err: any) => {
          this.uploadingImages = false;
          this.snackBar.open(err?.error?.message ?? 'Image upload failed', 'Close', { duration: 2500 });
          this.saving = false;
        },
      });
    } else {
      uploadAndSave([]);
    }
  }

  // ── Inline actions ─────────────────────────────────────
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
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  }
}

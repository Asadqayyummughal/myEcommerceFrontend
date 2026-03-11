import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { Product } from '@models/product.model';

interface AttributeRow { key: string; value: string; }

interface VariantForm {
  sku: string;
  price: number | null;
  stock: number | null;
  reservedStock: number;
  attributes: AttributeRow[];
}

interface ProductForm {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number | null;
  salePrice: number | null;
  currency: string;
  sku: string;
  brand: string;
  tags: string;
  stock: number | null;
  categories: string[];
  subcategories: string[];
  variants: VariantForm[];
  isActive: boolean;
}

interface ImagePreview {
  file: File | null;
  previewUrl: string;
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
  categories: any[] = [];
  subcategories: any[] = [];
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

  readonly currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'PKR'];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadSubcategories();
  }

  private emptyForm(): ProductForm {
    return {
      title: '', slug: '', description: '', shortDescription: '',
      price: null, salePrice: null, currency: 'USD',
      sku: '', brand: '', tags: '', stock: null,
      categories: [], subcategories: [],
      variants: [], isActive: true,
    };
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

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data ?? res.categories ?? res ?? []; },
      error: () => { this.categories = []; },
    });
  }

  loadSubcategories(): void {
    this.adminService.getSubcategories().subscribe({
      next: (res: any) => { this.subcategories = res.data ?? res.subcategories ?? res ?? []; },
      error: () => { this.subcategories = []; },
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadProducts(); }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  // ── Slug auto-generate ────────────────────────────────
  autoSlug(): void {
    if (!this.editingProduct || !this.form.slug) {
      this.form.slug = this.form.title
        .toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  }

  // ── Categories ────────────────────────────────────────
  toggleCategory(id: string): void {
    const idx = this.form.categories.indexOf(id);
    if (idx === -1) {
      this.form.categories.push(id);
    } else {
      this.form.categories.splice(idx, 1);
      // deselect subcategories that belonged to this category
      const orphaned = this.subcategories
        .filter(s => (s.category?._id ?? s.category) === id)
        .map(s => s._id);
      this.form.subcategories = this.form.subcategories.filter(sid => !orphaned.includes(sid));
    }
  }

  isCategorySelected(id: string): boolean {
    return this.form.categories.includes(id);
  }

  // ── Subcategories ─────────────────────────────────────
  /** Returns subcategories whose parent category is currently selected */
  visibleSubcategories(): any[] {
    return this.subcategories.filter(s =>
      this.form.categories.includes(s.category?._id ?? s.category)
    );
  }

  toggleSubcategory(id: string): void {
    const idx = this.form.subcategories.indexOf(id);
    if (idx === -1) this.form.subcategories.push(id);
    else this.form.subcategories.splice(idx, 1);
  }

  isSubcategorySelected(id: string): boolean {
    return this.form.subcategories.includes(id);
  }

  subcategoriesForCategory(catId: string): any[] {
    return this.subcategories.filter(s => (s.category?._id ?? s.category) === catId);
  }

  parentCategoryName(sub: any): string {
    if (sub.category?.name) return sub.category.name;
    return this.categories.find(c => c._id === sub.category)?.name ?? '';
  }

  // ── Variants ──────────────────────────────────────────
  addVariant(): void {
    this.form.variants.push({ sku: '', price: null, stock: null, reservedStock: 0, attributes: [] });
  }

  removeVariant(i: number): void {
    this.form.variants.splice(i, 1);
  }

  addAttribute(variantIndex: number): void {
    this.form.variants[variantIndex].attributes.push({ key: '', value: '' });
  }

  removeAttribute(variantIndex: number, attrIndex: number): void {
    this.form.variants[variantIndex].attributes.splice(attrIndex, 1);
  }

  private buildVariantsPayload(): any[] {
    return this.form.variants.map(v => {
      const attrs: Record<string, string> = {};
      v.attributes.forEach(a => { if (a.key.trim()) attrs[a.key.trim()] = a.value.trim(); });
      return {
        sku: v.sku.trim(),
        price: v.price !== null ? Number(v.price) : undefined,
        stock: Number(v.stock ?? 0),
        reservedStock: Number(v.reservedStock),
        attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
      };
    }).filter(v => v.sku);
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
      title:            product.title ?? '',
      slug:             (product as any).slug ?? '',
      description:      product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      price:            product.price ?? null,
      salePrice:        product.salePrice ?? null,
      currency:         product.currency ?? 'USD',
      sku:              product.sku ?? '',
      brand:            product.brand ?? '',
      tags:             (product.tags ?? []).join(', '),
      stock:            product.stock ?? null,
      categories:       (product.categories ?? []).map((c: any) => c?._id ?? c).filter(Boolean),
      subcategories:    ((product as any).subcategories ?? []).map((s: any) => s?._id ?? s).filter(Boolean),
      variants:         (product.variants ?? []).map(v => ({
        sku:          v.sku ?? '',
        price:        v.price ?? null,
        stock:        v.stock ?? null,
        reservedStock: v.reservedStock ?? 0,
        attributes:   Object.entries(v.attributes ?? {}).map(([key, value]) => ({ key, value })),
      })),
      isActive: product.isActive ?? true,
    };
    this.imagePreviews = (product.images ?? []).map(path => ({
      file: null,
      previewUrl: path.startsWith('http') ? path : this.apiUrl + path,
      isExisting: true,
    }));
    this.showModal = true;
  }

  closeModal(): void {
    this.imagePreviews.filter(p => !p.isExisting).forEach(p => URL.revokeObjectURL(p.previewUrl));
    this.showModal = false;
  }

  // ── Image handling ────────────────────────────────────
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      this.imagePreviews.push({ file, previewUrl: URL.createObjectURL(file), isExisting: false });
    });
    input.value = '';
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
      .map(p => p.previewUrl.startsWith(this.apiUrl) ? p.previewUrl.slice(this.apiUrl.length) : p.previewUrl);

    const buildPayload = (uploadedUrls: string[]) => ({
      title:            this.form.title.trim(),
      slug:             this.form.slug.trim() || undefined,
      description:      this.form.description.trim() || undefined,
      shortDescription: this.form.shortDescription.trim() || undefined,
      price:            Number(this.form.price),
      salePrice:        this.form.salePrice ? Number(this.form.salePrice) : null,
      currency:         this.form.currency,
      sku:              this.form.sku.trim() || undefined,
      brand:            this.form.brand.trim() || undefined,
      tags:             this.form.tags ? this.form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      categories:       this.form.categories,
      subcategories:    this.form.subcategories,
      stock:            Number(this.form.stock),
      images:           [...existingPaths, ...uploadedUrls],
      variants:         this.buildVariantsPayload(),
      isActive:         this.form.isActive,
    });

    const doSave = (uploadedUrls: string[]) => {
      const payload = buildPayload(uploadedUrls);
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
          doSave(Array.isArray(uploaded) ? uploaded : [uploaded]);
        },
        error: (err: any) => {
          this.uploadingImages = false;
          this.snackBar.open(err?.error?.message ?? 'Image upload failed', 'Close', { duration: 2500 });
          this.saving = false;
        },
      });
    } else {
      doSave([]);
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

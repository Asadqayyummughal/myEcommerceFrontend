import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VendorService } from '../../../services/vendor.service';

interface AttributeRow { key: string; value: string; }

interface VariantForm {
  sku: string;
  price: number | null;
  stock: number | null;
  reservedStock: number;
  attributes: AttributeRow[];
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './edit-product.html',
})
export class EditProduct implements OnInit {
  productId = '';
  loading = true;
  saving = false;
  error = '';
  success = '';

  categories: any[] = [];
  subcategories: any[] = [];

  // images already saved on backend
  existingImages: string[] = [];
  removedImages: string[] = [];

  // new files chosen locally
  selectedFiles: File[] = [];
  newPreviews: string[] = [];

  readonly apiUrl = 'http://localhost:3000/';
  readonly currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'PKR'];

  form = {
    title:            '',
    slug:             '',
    description:      '',
    shortDescription: '',
    price:            null as number | null,
    salePrice:        null as number | null,
    currency:         'USD',
    stock:            null as number | null,
    sku:              '',
    brand:            '',
    tags:             '',
    categories:       [] as string[],
    subcategories:    [] as string[],
    variants:         [] as VariantForm[],
    isActive:         true,
  };

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') ?? '';

    this.vendorService.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data ?? res ?? []; },
      error: () => {},
    });
    this.vendorService.getSubcategories().subscribe({
      next: (res: any) => { this.subcategories = res.data ?? res ?? []; },
      error: () => {},
    });

    this.vendorService.getProduct(this.productId).subscribe({
      next: (res: any) => {
        const p = res.data ?? res;
        this.form.title            = p.title ?? '';
        this.form.slug             = p.slug ?? '';
        this.form.description      = p.description ?? '';
        this.form.shortDescription = p.shortDescription ?? '';
        this.form.price            = p.price ?? null;
        this.form.salePrice        = p.salePrice ?? null;
        this.form.currency         = p.currency ?? 'USD';
        this.form.stock            = p.stock ?? null;
        this.form.sku              = p.sku ?? '';
        this.form.brand            = p.brand ?? '';
        this.form.tags             = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? '');
        this.form.isActive         = p.isActive ?? true;

        const rawCats = p.categories ?? [];
        this.form.categories = rawCats.map((c: any) => c?._id ?? c);

        const rawSubs = p.subcategories ?? [];
        this.form.subcategories = rawSubs.map((s: any) => s?._id ?? s);

        this.existingImages = p.images ?? [];

        this.form.variants = (p.variants ?? []).map((v: any) => ({
          sku:          v.sku ?? '',
          price:        v.price ?? null,
          stock:        v.stock ?? null,
          reservedStock: v.reservedStock ?? 0,
          attributes:   Object.entries(v.attributes ?? {}).map(([key, value]) => ({ key, value: value as string })),
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load product.';
        this.loading = false;
      },
    });
  }

  // ── Slug ─────────────────────────────────────────────
  autoSlug(): void {
    // only rewrite slug if the user hasn't manually edited it
  }

  // ── Categories ────────────────────────────────────────
  toggleCategory(id: string): void {
    const idx = this.form.categories.indexOf(id);
    if (idx === -1) {
      this.form.categories.push(id);
    } else {
      this.form.categories.splice(idx, 1);
      const orphaned = this.subcategories
        .filter(s => (s.category?._id ?? s.category) === id)
        .map(s => s._id);
      this.form.subcategories = this.form.subcategories.filter(sid => !orphaned.includes(sid));
    }
  }

  isCategorySelected(id: string): boolean { return this.form.categories.includes(id); }

  // ── Subcategories ─────────────────────────────────────
  subcategoriesForCategory(catId: string): any[] {
    return this.subcategories.filter(s => (s.category?._id ?? s.category) === catId);
  }

  toggleSubcategory(id: string): void {
    const idx = this.form.subcategories.indexOf(id);
    if (idx === -1) this.form.subcategories.push(id);
    else this.form.subcategories.splice(idx, 1);
  }

  isSubcategorySelected(id: string): boolean { return this.form.subcategories.includes(id); }

  hasVisibleSubcategories(): boolean {
    return this.form.categories.some(catId => this.subcategoriesForCategory(catId).length > 0);
  }

  // ── Existing images ───────────────────────────────────
  imageUrl(img: string): string {
    if (!img) return '';
    return img.startsWith('http') ? img : `${this.apiUrl}${img}`;
  }

  removeExistingImage(img: string): void {
    this.removedImages.push(img);
    this.existingImages = this.existingImages.filter(i => i !== img);
  }

  // ── New files ─────────────────────────────────────────
  get totalImageCount(): number { return this.existingImages.length + this.selectedFiles.length; }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const remaining = 6 - this.totalImageCount;
    const toAdd = Array.from(input.files).slice(0, remaining);
    this.selectedFiles = [...this.selectedFiles, ...toAdd];
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => this.newPreviews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeNewFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.newPreviews.splice(index, 1);
  }

  // ── Variants ──────────────────────────────────────────
  addVariant(): void {
    this.form.variants.push({ sku: '', price: null, stock: null, reservedStock: 0, attributes: [] });
  }

  removeVariant(i: number): void { this.form.variants.splice(i, 1); }

  addAttribute(vi: number): void { this.form.variants[vi].attributes.push({ key: '', value: '' }); }

  removeAttribute(vi: number, ai: number): void { this.form.variants[vi].attributes.splice(ai, 1); }

  private buildVariantsPayload(): any[] {
    return this.form.variants.map(v => {
      const attrs: Record<string, string> = {};
      v.attributes.forEach(a => { if (a.key.trim()) attrs[a.key.trim()] = a.value.trim(); });
      return {
        sku:          v.sku.trim(),
        price:        v.price !== null ? Number(v.price) : undefined,
        stock:        Number(v.stock ?? 0),
        reservedStock: Number(v.reservedStock),
        attributes:   Object.keys(attrs).length > 0 ? attrs : undefined,
      };
    }).filter(v => v.sku);
  }

  // ── Submit ────────────────────────────────────────────
  submit(): void {
    if (this.saving || !this.form.title.trim() || this.form.price === null) return;
    this.saving = true;
    this.error = '';

    const hasChangedImages = this.selectedFiles.length > 0 || this.removedImages.length > 0;

    if (hasChangedImages) {
      const fd = new FormData();
      fd.append('title',    this.form.title.trim());
      if (this.form.slug.trim())             fd.append('slug',             this.form.slug.trim());
      if (this.form.description.trim())      fd.append('description',      this.form.description.trim());
      if (this.form.shortDescription.trim()) fd.append('shortDescription', this.form.shortDescription.trim());
      fd.append('price',    String(this.form.price));
      fd.append('currency', this.form.currency);
      if (this.form.salePrice !== null)      fd.append('salePrice', String(this.form.salePrice));
      fd.append('stock',    String(this.form.stock ?? 0));
      if (this.form.sku.trim())   fd.append('sku',   this.form.sku.trim());
      if (this.form.brand.trim()) fd.append('brand', this.form.brand.trim());
      if (this.form.tags.trim())  fd.append('tags',  this.form.tags.trim());
      fd.append('isActive', String(this.form.isActive));
      this.form.categories.forEach(id => fd.append('categories', id));
      this.form.subcategories.forEach(id => fd.append('subcategories', id));
      this.existingImages.forEach(url => fd.append('keepImages', url));
      this.selectedFiles.forEach(f => fd.append('images', f));
      const variants = this.buildVariantsPayload();
      if (variants.length > 0) fd.append('variants', JSON.stringify(variants));
      this.doUpdate(fd);
    } else {
      const payload: any = {
        title:            this.form.title.trim(),
        description:      this.form.description.trim() || undefined,
        shortDescription: this.form.shortDescription.trim() || undefined,
        price:            Number(this.form.price),
        currency:         this.form.currency,
        stock:            Number(this.form.stock ?? 0),
        isActive:         this.form.isActive,
        categories:       this.form.categories,
        subcategories:    this.form.subcategories,
      };
      if (this.form.slug.trim())       payload.slug     = this.form.slug.trim();
      if (this.form.salePrice !== null) payload.salePrice = Number(this.form.salePrice);
      if (this.form.sku.trim())        payload.sku      = this.form.sku.trim();
      if (this.form.brand.trim())      payload.brand    = this.form.brand.trim();
      if (this.form.tags.trim())       payload.tags     = this.form.tags.trim();
      const variants = this.buildVariantsPayload();
      if (variants.length > 0) payload.variants = variants;
      this.doUpdate(payload);
    }
  }

  private doUpdate(payload: any): void {
    this.vendorService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.success = 'Product updated successfully!';
        this.saving = false;
        setTimeout(() => this.router.navigate(['/products']), 1500);
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to update product.';
        this.saving = false;
      },
    });
  }
}

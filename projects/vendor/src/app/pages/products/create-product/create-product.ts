import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './create-product.html',
})
export class CreateProduct implements OnInit {
  saving = false;
  error = '';
  success = '';

  categories: any[] = [];
  subcategories: any[] = [];

  selectedFiles: File[] = [];
  previews: string[] = [];

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
    category:         '',
    subCategory:      '',
    variants:         [] as VariantForm[],
    isActive:         true,
  };

  constructor(private vendorService: VendorService, private router: Router) {}

  ngOnInit(): void {
    this.vendorService.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data ?? res ?? []; },
      error: () => {},
    });
    this.vendorService.getSubcategories().subscribe({
      next: (res: any) => { this.subcategories = res.data ?? res ?? []; },
      error: () => {},
    });
  }

  // ── Slug ─────────────────────────────────────────────
  autoSlug(): void {
    if (!this.form.slug) {
      this.form.slug = this.form.title
        .toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  }

  // ── Category / Subcategory ────────────────────────────
  onCategoryChange(): void {
    this.form.subCategory = '';
  }

  get filteredSubcategories(): any[] {
    if (!this.form.category) return [];
    return this.subcategories.filter(s => (s.category?._id ?? s.category) === this.form.category);
  }

  // ── Variants ──────────────────────────────────────────
  addVariant(): void {
    this.form.variants.push({ sku: '', price: null, stock: null, reservedStock: 0, attributes: [] });
  }

  removeVariant(i: number): void {
    this.form.variants.splice(i, 1);
  }

  addAttribute(vi: number): void {
    this.form.variants[vi].attributes.push({ key: '', value: '' });
  }

  removeAttribute(vi: number, ai: number): void {
    this.form.variants[vi].attributes.splice(ai, 1);
  }

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

  // ── Images ────────────────────────────────────────────
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const remaining = 6 - this.selectedFiles.length;
    const toAdd = Array.from(input.files).slice(0, remaining);
    this.selectedFiles = [...this.selectedFiles, ...toAdd];
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => this.previews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  // ── Submit ────────────────────────────────────────────
  submit(): void {
    if (this.saving || !this.form.title.trim() || this.form.price === null) return;
    this.saving = true;
    this.error = '';

    const fd = new FormData();
    fd.append('title',       this.form.title.trim());
    if (this.form.slug.trim())             fd.append('slug',             this.form.slug.trim());
    if (this.form.description.trim())      fd.append('description',      this.form.description.trim());
    if (this.form.shortDescription.trim()) fd.append('shortDescription', this.form.shortDescription.trim());
    fd.append('price',    String(this.form.price));
    fd.append('currency', this.form.currency);
    if (this.form.salePrice !== null)      fd.append('salePrice', String(this.form.salePrice));
    fd.append('stock',    String(this.form.stock ?? 0));
    if (this.form.sku.trim())              fd.append('sku',   this.form.sku.trim());
    if (this.form.brand.trim())            fd.append('brand', this.form.brand.trim());
    if (this.form.tags.trim())             fd.append('tags',  this.form.tags.trim());
    fd.append('isActive', String(this.form.isActive));

    if (this.form.category)    fd.append('category',    this.form.category);
    if (this.form.subCategory) fd.append('subCategory', this.form.subCategory);

    const variants = this.buildVariantsPayload();
    if (variants.length > 0) fd.append('variants', JSON.stringify(variants));

    this.selectedFiles.forEach(f => fd.append('images', f));

    this.vendorService.createProduct(fd).subscribe({
      next: () => {
        this.success = 'Product created successfully!';
        this.saving = false;
        setTimeout(() => this.router.navigate(['/products']), 1500);
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to create product.';
        this.saving = false;
      },
    });
  }
}

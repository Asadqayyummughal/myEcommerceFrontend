import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { VendorService } from '../../../services/vendor.service';

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
  filteredSubcategories: any[] = [];

  selectedFiles: File[] = [];
  previews: string[] = [];

  form = {
    name: '',
    description: '',
    price: null as number | null,
    stock: null as number | null,
    sku: '',
    weight: null as number | null,
    category: '',
    subcategory: '',
    tags: '',
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

  onCategoryChange(): void {
    this.form.subcategory = '';
    this.filteredSubcategories = this.subcategories.filter(
      s => (s.category?._id ?? s.category) === this.form.category
    );
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const newFiles = Array.from(input.files);
    const remaining = 6 - this.selectedFiles.length;
    const toAdd = newFiles.slice(0, remaining);
    this.selectedFiles = [...this.selectedFiles, ...toAdd];
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => this.previews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  submit(): void {
    if (this.saving || !this.form.name || !this.form.price) return;
    this.saving = true;
    this.error = '';

    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('description', this.form.description);
    fd.append('price', String(this.form.price));
    fd.append('stock', String(this.form.stock ?? 0));
    if (this.form.sku) fd.append('sku', this.form.sku);
    if (this.form.weight) fd.append('weight', String(this.form.weight));
    if (this.form.category) fd.append('category', this.form.category);
    if (this.form.subcategory) fd.append('subcategory', this.form.subcategory);
    if (this.form.tags) fd.append('tags', this.form.tags);
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

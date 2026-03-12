import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './categories.html',
})
export class Categories implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  loading = true;
  showModal = false;
  showSubModal = false;
  editingCategory: any = null;
  saving = false;
  form = { name: '', description: '', slug: '' };
  subForm = { name: '', category: '', slug: '', level: 1, parent: '' };

  readonly iconColors = [
    'bg-blue-100 text-blue-600',
    'bg-violet-100 text-violet-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
  ];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data ?? res.categories ?? res ?? [];
        this.loading = false;
      },
      error: () => { this.categories = []; this.loading = false; },
    });
  }

  loadSubcategories(): void {
    this.adminService.getSubcategories().subscribe({
      next: (res: any) => {
        this.subcategories = res.data ?? res.subcategories ?? res ?? [];
      },
      error: () => { this.subcategories = []; },
    });
  }

  colorClass(index: number): string {
    return this.iconColors[index % this.iconColors.length];
  }

  subcategoriesFor(cat: any): any[] {
    return this.subcategories.filter(
      (s) => (s.category?._id ?? s.category) === cat._id
    );
  }

  openCreate(): void {
    this.form = { name: '', description: '', slug: '' };
    this.editingCategory = null;
    this.showModal = true;
  }

  openEdit(cat: any): void {
    this.form = { name: cat.name ?? '', description: cat.description ?? '', slug: cat.slug ?? '' };
    this.editingCategory = cat;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.snackBar.open('Name is required', 'Close', { duration: 3000 });
      return;
    }
    this.saving = true;
    const payload: any = { name: this.form.name.trim(), description: this.form.description.trim() };
    if (this.form.slug.trim()) payload.slug = this.form.slug.trim();

    if (this.editingCategory) {
      this.adminService.updateCategory(this.editingCategory._id, payload).subscribe({
        next: () => {
          this.snackBar.open('Category updated', 'Close', { duration: 3000 });
          this.showModal = false;
          this.saving = false;
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Failed to update category', 'Close', { duration: 3000 });
          this.saving = false;
        },
      });
    } else {
      this.adminService.createCategory(payload).subscribe({
        next: () => {
          this.snackBar.open('Category created', 'Close', { duration: 3000 });
          this.showModal = false;
          this.saving = false;
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Failed to create category', 'Close', { duration: 3000 });
          this.saving = false;
        },
      });
    }
  }

  deleteCategory(cat: any): void {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    this.adminService.deleteCategory(cat._id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c._id !== cat._id);
        this.snackBar.open('Category deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete category', 'Close', { duration: 3000 });
      },
    });
  }

  autoSlug(): void {
    if (!this.editingCategory || !this.form.slug) {
      this.form.slug = this.form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  }

  autoSubSlug(): void {
    this.subForm.slug = this.subForm.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  subcategoriesForSubCreate(): any[] {
    return this.subcategories.filter(s => (s.category?._id ?? s.category) === this.subForm.category);
  }

  openSubCreate(cat: any): void {
    this.subForm = { name: '', category: cat._id, slug: '', level: 1, parent: '' };
    this.showSubModal = true;
  }

  closeSubModal(): void {
    this.showSubModal = false;
  }

  saveSubcategory(): void {
    if (!this.subForm.name.trim()) {
      this.snackBar.open('Subcategory name is required', 'Close', { duration: 3000 });
      return;
    }
    this.saving = true;
    const subPayload: any = {
      name:     this.subForm.name.trim(),
      category: this.subForm.category,
      level:    this.subForm.level,
    };
    if (this.subForm.slug.trim()) subPayload.slug = this.subForm.slug.trim();
    if (this.subForm.parent)      subPayload.parent = this.subForm.parent;
    this.adminService.createSubcategory(subPayload).subscribe({
      next: () => {
        this.snackBar.open('Subcategory created', 'Close', { duration: 3000 });
        this.showSubModal = false;
        this.saving = false;
        this.loadSubcategories();
      },
      error: () => {
        this.snackBar.open('Failed to create subcategory', 'Close', { duration: 3000 });
        this.saving = false;
      },
    });
  }

  deleteSubcategory(sub: any): void {
    if (!confirm(`Delete subcategory "${sub.name}"?`)) return;
    this.adminService.deleteSubcategory(sub._id).subscribe({
      next: () => {
        this.subcategories = this.subcategories.filter((s) => s._id !== sub._id);
        this.snackBar.open('Subcategory deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete subcategory', 'Close', { duration: 3000 });
      },
    });
  }

  parentCategoryName(sub: any): string {
    if (sub.category?.name) return sub.category.name;
    const found = this.categories.find((c) => c._id === sub.category);
    return found?.name ?? '—';
  }
}

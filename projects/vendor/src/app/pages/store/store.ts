import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './store.html',
})
export class Store implements OnInit {
  loading = true;
  saving = false;
  store: any = null;
  error = '';
  success = '';

  form = {
    name: '',
    description: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
  };

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadStore();
  }

  loadStore(): void {
    this.vendorService.getMyStore().subscribe({
      next: (res: any) => {
        this.store = res.data ?? res;
        if (this.store) {
          this.form.name = this.store.name ?? '';
          this.form.description = this.store.description ?? '';
          this.form.logo = this.store.logo ?? '';
          this.form.contactEmail = this.store.contactEmail ?? '';
          this.form.contactPhone = this.store.contactPhone ?? '';
        }
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  submit(): void {
    if (this.saving) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    const action = this.store?._id
      ? this.vendorService.updateStore(this.store._id, this.form)
      : this.vendorService.createStore(this.form);

    action.subscribe({
      next: (res: any) => {
        this.store = res.data ?? res;
        this.success = this.store?._id ? 'Store updated successfully!' : 'Store created successfully!';
        this.saving = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to save store.';
        this.saving = false;
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}

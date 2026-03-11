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

  readonly apiUrl = 'http://localhost:3000';

  form = {
    name: '',
    slug: '',
    description: '',
    policies: {
      shipping: '',
      returns: '',
      warranty: '',
    },
  };

  // logo
  logoFile: File | null = null;
  logoPreview: string | null = null;

  // banner
  bannerFile: File | null = null;
  bannerPreview: string | null = null;

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
          this.form.slug = this.store.slug ?? '';
          this.form.description = this.store.description ?? '';
          this.form.policies = {
            shipping: this.store.policies?.shipping ?? '',
            returns: this.store.policies?.returns ?? '',
            warranty: this.store.policies?.warranty ?? '',
          };
          this.logoPreview = this.resolveUrl(this.store.logo) ?? null;
          this.bannerPreview = this.resolveUrl(this.store.banner) ?? null;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // ── Slug ──────────────────────────────────────────────
  autoSlug(): void {
    if (!this.store) {
      this.form.slug = this.form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  }

  // ── Image helpers ─────────────────────────────────────
  resolveUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `${this.apiUrl}${path}`;
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => (this.logoPreview = e.target?.result as string);
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
  }

  onBannerSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.bannerFile = file;
    const reader = new FileReader();
    reader.onload = (e) => (this.bannerPreview = e.target?.result as string);
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  removeBanner(): void {
    this.bannerFile = null;
    this.bannerPreview = null;
  }

  // ── Submit ────────────────────────────────────────────
  submit(): void {
    if (this.saving || !this.form.name.trim()) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    const hasFiles = this.logoFile || this.bannerFile;
    if (hasFiles) {
      const fd = new FormData();
      fd.append('name', this.form.name.trim());
      if (this.form.slug.trim()) fd.append('slug', this.form.slug.trim());
      if (this.form.description.trim()) fd.append('description', this.form.description.trim());
      if (this.form.policies.shipping.trim())
        fd.append('policies[shipping]', this.form.policies.shipping.trim());
      if (this.form.policies.returns.trim())
        fd.append('policies[returns]', this.form.policies.returns.trim());
      if (this.form.policies.warranty.trim())
        fd.append('policies[warranty]', this.form.policies.warranty.trim());
      if (this.logoFile) fd.append('logo', this.logoFile);
      if (this.bannerFile) fd.append('banner', this.bannerFile);
      this.doSave(fd);
    } else {
      const payload: any = {
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        policies: {
          shipping: this.form.policies.shipping.trim() || undefined,
          returns: this.form.policies.returns.trim() || undefined,
          warranty: this.form.policies.warranty.trim() || undefined,
        },
      };
      if (this.form.slug.trim()) payload.slug = this.form.slug.trim();
      this.doSave(payload);
    }
  }

  private doSave(payload: any): void {
    const isNew = !this.store?._id;
    const action = isNew
      ? this.vendorService.createStore(payload)
      : this.vendorService.updateStore(this.store._id, payload);

    action.subscribe({
      next: (res: any) => {
        this.store = res.data ?? res;
        this.success = isNew ? 'Store created successfully!' : 'Store updated successfully!';
        this.saving = false;
        // refresh previews from saved data
        this.logoPreview = this.resolveUrl(this.store.logo) ?? null;
        this.bannerPreview = this.resolveUrl(this.store.banner) ?? null;
        this.logoFile = null;
        this.bannerFile = null;
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to save store.';
        this.saving = false;
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}

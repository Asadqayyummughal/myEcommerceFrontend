import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

type StoreStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './stores.html',
})
export class Stores implements OnInit {
  allStores: any[] = [];
  filtered: any[] = [];
  loading = true;
  activeTab: StoreStatus = 'all';
  actingId: string | null = null;
  search = '';
  readonly apiUrl = 'http://localhost:3000/';

  readonly tabs: { label: string; value: StoreStatus; icon: string }[] = [
    { label: 'All',       value: 'all',       icon: 'grid_view'       },
    { label: 'Pending',   value: 'pending',   icon: 'hourglass_empty' },
    { label: 'Approved',  value: 'approved',  icon: 'check_circle'    },
    { label: 'Rejected',  value: 'rejected',  icon: 'cancel'          },
    { label: 'Suspended', value: 'suspended', icon: 'block'           },
  ];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this.loading = true;
    this.adminService.getStores().subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.allStores = Array.isArray(d) ? d : (d.stores ?? []);
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.allStores = []; this.filtered = []; this.loading = false; },
    });
  }

  switchTab(tab: StoreStatus): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let list = this.activeTab === 'all'
      ? this.allStores
      : this.allStores.filter(s => s.status === this.activeTab);

    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q)
      );
    }
    this.filtered = list;
  }

  tabCount(tab: StoreStatus): number {
    if (tab === 'all') return this.allStores.length;
    return this.allStores.filter(s => s.status === tab).length;
  }

  // ── Actions ───────────────────────────────────────────
  setStatus(store: any, status: string): void {
    if (this.actingId) return;
    this.actingId = store._id;
    this.adminService.updateStoreStatus(store._id, status).subscribe({
      next: (res: any) => {
        const updated = res.data ?? res;
        const idx = this.allStores.findIndex(s => s._id === store._id);
        if (idx !== -1) this.allStores[idx] = { ...this.allStores[idx], status: updated.status ?? status };
        this.applyFilter();
        this.snackBar.open(`"${store.name}" marked as ${status}`, 'Close', { duration: 3000 });
        this.actingId = null;
      },
      error: () => {
        this.snackBar.open('Action failed. Please try again.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
        this.actingId = null;
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
  logoUrl(logo: string | undefined): string | null {
    if (!logo) return null;
    return logo.startsWith('http') ? logo : `${this.apiUrl}${logo}`;
  }

  initials(name: string): string {
    return (name ?? '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  avatarColor(name: string): string {
    const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      suspended: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }
}

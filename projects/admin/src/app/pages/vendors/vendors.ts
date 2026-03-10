import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

type VendorStatus = 'pending' | 'active' | 'rejected';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './vendors.html',
})
export class Vendors implements OnInit {
  vendors: any[] = [];
  loading = true;
  activeTab: VendorStatus = 'pending';
  approvingId: string | null = null;

  readonly tabs: { label: string; value: VendorStatus; icon: string }[] = [
    { label: 'Pending',  value: 'pending',  icon: 'hourglass_empty' },
    { label: 'Active',   value: 'active',   icon: 'check_circle'    },
    { label: 'Rejected', value: 'rejected', icon: 'cancel'          },
  ];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.loading = true;
    this.adminService.getVendors(this.activeTab).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.vendors = Array.isArray(d) ? d : (d.vendors ?? d.items ?? []);
        this.loading = false;
      },
      error: () => { this.vendors = []; this.loading = false; },
    });
  }

  switchTab(tab: VendorStatus): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.loadVendors();
  }

  approve(vendor: any): void {
    this.approvingId = vendor._id;
    this.adminService.approveVendor(vendor._id).subscribe({
      next: () => {
        this.snackBar.open(`${vendor.name} approved as vendor`, 'Close', { duration: 3000 });
        this.vendors = this.vendors.filter(v => v._id !== vendor._id);
        this.approvingId = null;
      },
      error: () => {
        this.snackBar.open('Approval failed', 'Close', { duration: 3000, panelClass: ['snack-error'] });
        this.approvingId = null;
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:  'bg-amber-100 text-amber-700',
      active:   'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return map[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }

  initials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  }

  avatarColor(name: string): string {
    const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const index = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[index];
  }
}

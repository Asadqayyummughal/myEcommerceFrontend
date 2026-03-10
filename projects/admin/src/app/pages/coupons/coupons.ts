import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './coupons.html',
})
export class Coupons implements OnInit {
  coupons: any[] = [];
  loading = true;
  showModal = false;
  editingCoupon: any = null;
  saving = false;

  form = {
    code: '',
    type: 'percent',
    value: 0,
    minOrderAmount: 0,
    maxUses: 0,
    expiresAt: '',
  };

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading = true;
    this.adminService.getCoupons().subscribe({
      next: (res: any) => {
        this.coupons = res.data ?? res.coupons ?? res ?? [];
        this.loading = false;
      },
      error: () => {
        this.coupons = [];
        this.loading = false;
        this.snackBar.open('Failed to load coupons', 'Close', { duration: 2000 });
      },
    });
  }

  openCreate(): void {
    this.form = { code: '', type: 'percent', value: 0, minOrderAmount: 0, maxUses: 0, expiresAt: '' };
    this.editingCoupon = null;
    this.showModal = true;
  }

  openEdit(coupon: any): void {
    this.editingCoupon = coupon;
    this.form = {
      code: coupon.code ?? '',
      type: coupon.type ?? 'percent',
      value: coupon.value ?? 0,
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxUses: coupon.maxUses ?? 0,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    this.saving = true;
    const payload = { ...this.form, code: this.form.code.toUpperCase() };

    if (this.editingCoupon) {
      this.adminService.updateCoupon(this.editingCoupon._id, payload).subscribe({
        next: () => {
          this.snackBar.open('Coupon updated', '✓', { duration: 2000 });
          this.saving = false;
          this.showModal = false;
          this.loadCoupons();
        },
        error: () => {
          this.snackBar.open('Failed to update coupon', 'Close', { duration: 2000 });
          this.saving = false;
        },
      });
    } else {
      this.adminService.createCoupon(payload).subscribe({
        next: () => {
          this.snackBar.open('Coupon created', '✓', { duration: 2000 });
          this.saving = false;
          this.showModal = false;
          this.loadCoupons();
        },
        error: () => {
          this.snackBar.open('Failed to create coupon', 'Close', { duration: 2000 });
          this.saving = false;
        },
      });
    }
  }

  deleteCoupon(coupon: any): void {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    this.adminService.deleteCoupon(coupon._id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter(c => c._id !== coupon._id);
        this.snackBar.open('Coupon deleted', '✓', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete coupon', 'Close', { duration: 2000 });
      },
    });
  }

  typeLabel(type: string): string {
    return type === 'percent' ? 'Percent Off' : 'Flat Discount';
  }

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './payouts.html',
})
export class Payouts implements OnInit {
  loading = true;
  payouts: any[] = [];
  withdrawingId = '';
  error = '';
  success = '';

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadPayouts();
  }

  loadPayouts(): void {
    this.vendorService.getPayouts().subscribe({
      next: (res: any) => {
        this.payouts = res.data?.payouts ?? res.data ?? res.payouts ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  withdraw(payoutId: string): void {
    if (this.withdrawingId) return;
    this.withdrawingId = payoutId;
    this.error = '';

    this.vendorService.withdrawPayout(payoutId).subscribe({
      next: () => {
        this.success = 'Withdrawal initiated successfully!';
        this.withdrawingId = '';
        this.loadPayouts();
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Withdrawal failed.';
        this.withdrawingId = '';
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      failed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      rejected:  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    };
    return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}

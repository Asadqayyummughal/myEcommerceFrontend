import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './wallet.html',
})
export class Wallet implements OnInit {
  loading = true;
  requesting = false;
  wallet: any = null;
  error = '';
  success = '';
  showRequestModal = false;

  payoutForm = {
    amount: null as number | null,
    method: 'stripe',
  };

  constructor(
    private vendorService: VendorService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) { this.loading = false; return; }

    this.vendorService.getWallet(userId).subscribe({
      next: (res: any) => {
        this.wallet = res.data ?? res;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get availableBalance(): number {
    return (this.wallet?.balance ?? 0) / 100;
  }

  get lockedBalance(): number {
    return (this.wallet?.lockedBalance ?? 0) / 100;
  }

  get totalEarned(): number {
    return (this.wallet?.totalEarned ?? 0) / 100;
  }

  requestPayout(): void {
    if (this.requesting || !this.payoutForm.amount) return;
    this.requesting = true;
    this.error = '';

    this.vendorService.requestPayout({
      amount: this.payoutForm.amount * 100, // convert to cents
      method: this.payoutForm.method,
    }).subscribe({
      next: () => {
        this.success = 'Payout request submitted successfully!';
        this.showRequestModal = false;
        this.payoutForm = { amount: null, method: 'stripe' };
        this.requesting = false;
        this.loadWallet();
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to request payout.';
        this.requesting = false;
      },
    });
  }
}

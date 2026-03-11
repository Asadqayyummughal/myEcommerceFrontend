import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-stripe-onboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stripe-onboard.html',
})
export class StripeOnboard implements OnInit {
  loading = true;
  connecting = false;
  wallet: any = null;
  error = '';

  constructor(
    private vendorService: VendorService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
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

  connect(): void {
    if (this.connecting) return;
    this.connecting = true;
    this.error = '';

    this.vendorService.onboardStripe().subscribe({
      next: (res: any) => {
        const url = res.data?.url ?? res.url;
        if (url) {
          window.location.href = url;
        } else {
          this.error = 'Failed to get Stripe onboarding link.';
          this.connecting = false;
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Failed to connect Stripe.';
        this.connecting = false;
      },
    });
  }
}

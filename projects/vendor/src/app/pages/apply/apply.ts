import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './apply.html',
})
export class Apply {
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private vendorService: VendorService,
    public authService: AuthService,
    private router: Router,
  ) {}

  apply(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';

    this.vendorService.applyVendor().subscribe({
      next: () => {
        this.submitted = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/pending']), 2000);
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Application failed. Please try again.';
        this.loading = false;
      },
    });
  }
}

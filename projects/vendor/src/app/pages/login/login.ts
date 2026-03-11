import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    if (!this.email || !this.password || this.loading) return;
    this.loading = true;
    this.error = '';

    // login() internally calls getUserProfile() — role is a populated object
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.auth.currentUser?.role?.name;
        if (role === 'vendor') {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'This portal is for vendors only. Apply below.';
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Invalid credentials. Please try again.';
        this.loading = false;
      },
    });
  }
}

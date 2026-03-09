import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        const role = res.data?.user?.role ?? res.user?.role;
        if (role !== 'admin' && role !== 'support') {
          this.authService.logout().subscribe();
          this.error = 'Access denied. Admin credentials required.';
          this.loading = false;
          return;
        }
        this.authService.scheduleAutoLogout();
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Invalid credentials.';
        this.loading = false;
      },
    });
  }
}

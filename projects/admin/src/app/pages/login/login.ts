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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    if (this.authService.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';

    // login() now internally calls getUserProfile() — currentUser is fully
    // populated (with role object) by the time the observable completes.
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.error = 'Login failed.';
          this.loading = false;
          return;
        }
        const role = this.authService.currentUser?.role?.name;
        if (role !== 'admin' && role !== 'support') {
          this.authService.logout().subscribe();
          this.error = 'Access denied. Admin credentials required.';
          this.loading = false;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Invalid credentials.';
        this.loading = false;
      },
    });
  }
}

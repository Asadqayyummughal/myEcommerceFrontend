import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  saving = false;
  orderCount = 0;
  totalSpent = 0;
  deliveredCount = 0;
  loadingStats = true;

  get user() {
    return this.authService.currentUser;
  }

  get initials(): string {
    const name = this.user?.name ?? 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get avatarColor(): string {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-violet-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
    ];
    const idx = (this.user?.name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  }

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private orderService: OrderService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [this.user?.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: this.user?.email ?? '', disabled: true }],
    });

    this.orderService.getOrders().subscribe({
      next: (res: any) => {
        const orders = res.data ?? res ?? [];
        this.orderCount = orders.length;
        this.deliveredCount = orders.filter((o: any) => o.status === 'delivered').length;
        this.totalSpent = orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.userService.updateProfile({ name: this.profileForm.value.name }).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.saving = false;
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Could not update profile.', 'Close', {
          duration: 4000,
        });
        this.saving = false;
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}

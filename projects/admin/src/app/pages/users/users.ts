import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  loading = true;
  searchQuery = '';
  currentPage = 1;
  pageSize = 15;
  total = 0;
  totalPages = 1;
  assigningId: string | null = null;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers({ page: this.currentPage, limit: this.pageSize, q: this.searchQuery || undefined }).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.users = d.items ?? d.users ?? d ?? [];
        this.total = d.meta?.total ?? this.users.length;
        this.totalPages = d.meta?.pages ?? Math.ceil(this.total / this.pageSize);
        this.loading = false;
      },
      error: () => { this.users = []; this.loading = false; },
    });
  }

  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.roles = Array.isArray(d) ? d : [];
      },
      error: () => { this.roles = []; },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  assignRole(user: any, roleId: string): void {
    if (!roleId) return;
    this.assigningId = user._id;
    this.adminService.assignRole(user._id, roleId).subscribe({
      next: () => {
        user.role = this.roles.find(r => r._id === roleId)?.name ?? user.role;
        this.snackBar.open('Role assigned successfully', 'Close', { duration: 3000 });
        this.assigningId = null;
      },
      error: () => {
        this.snackBar.open('Failed to assign role', 'Close', { duration: 3000, panelClass: ['snack-error'] });
        this.assigningId = null;
      },
    });
  }

  toggleBan(user: any): void {
    const action$ = user.isActive !== false
      ? this.adminService.banUser(user._id)
      : this.adminService.activateUser(user._id);

    action$.subscribe({
      next: () => {
        user.isActive = user.isActive === false;
        const msg = user.isActive ? 'User activated' : 'User banned';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Action failed', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      },
    });
  }

  initials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  }

  avatarColor(name: string): string {
    const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const index = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[index];
  }

  roleClass(role: string): string {
    const map: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      vendor: 'bg-violet-100 text-violet-700',
      seller: 'bg-blue-100 text-blue-700',
      support: 'bg-amber-100 text-amber-700',
      user: 'bg-gray-100 text-gray-600',
    };
    return map[role?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  }

  get pageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  }
}

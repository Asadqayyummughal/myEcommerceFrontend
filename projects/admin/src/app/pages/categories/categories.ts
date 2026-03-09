import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './categories.html',
})
export class Categories implements OnInit {
  categories: any[] = [];
  loading = true;

  readonly iconColors = [
    'bg-blue-100 text-blue-600',
    'bg-violet-100 text-violet-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
  ];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data ?? res.categories ?? res ?? [];
        this.loading = false;
      },
      error: () => { this.categories = []; this.loading = false; },
    });
  }

  colorClass(index: number): string {
    return this.iconColors[index % this.iconColors.length];
  }
}

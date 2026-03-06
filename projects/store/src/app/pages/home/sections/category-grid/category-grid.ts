import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '@models/category.model';

const ICON_MAP: Record<string, string> = {
  electronics: 'bolt',
  fashion: 'checkroom',
  home: 'home',
  beauty: 'spa',
  sports: 'sports_tennis',
  books: 'menu_book',
  food: 'local_cafe',
  photography: 'photo_camera',
  clothing: 'checkroom',
  toys: 'toys',
  jewelry: 'diamond',
  automotive: 'directions_car',
  health: 'health_and_safety',
  garden: 'yard',
  music: 'music_note',
  default: 'category',
};

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.scss',
})
export class CategoryGrid {
  @Input() categories: Category[] = [];

  constructor(private router: Router) {}

  getIcon(name: string): string {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(ICON_MAP)) {
      if (key.includes(k)) return v;
    }
    return ICON_MAP['default'];
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/products'], { queryParams: { categories: category._id } });
  }
}

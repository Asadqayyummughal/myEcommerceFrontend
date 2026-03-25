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
const CARD_PALETTES = [
  { bg: 'bg-orange-100 dark:bg-orange-900/40', icon: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-orange-50 dark:bg-orange-900/30', icon: 'text-orange-500 dark:text-orange-400' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', icon: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-orange-200 dark:bg-orange-900/50', icon: 'text-orange-700 dark:text-orange-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', icon: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-amber-50 dark:bg-amber-900/30', icon: 'text-amber-500 dark:text-amber-400' },
  { bg: 'bg-orange-50 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', icon: 'text-orange-500 dark:text-orange-400' },
];

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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

  getCardBg(index: number): string {
    return CARD_PALETTES[index % CARD_PALETTES.length].bg;
  }

  getIconColor(index: number): string {
    return CARD_PALETTES[index % CARD_PALETTES.length].icon;
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/products'], { queryParams: { categories: category._id } });
  }
}

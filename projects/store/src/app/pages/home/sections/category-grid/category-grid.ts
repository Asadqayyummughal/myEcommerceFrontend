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
  { bg: 'bg-blue-100 dark:bg-blue-900/40', icon: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', icon: 'text-violet-600 dark:text-violet-400' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', icon: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', icon: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-rose-100 dark:bg-rose-900/40', icon: 'text-rose-600 dark:text-rose-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', icon: 'text-cyan-600 dark:text-cyan-400' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', icon: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', icon: 'text-pink-600 dark:text-pink-400' },
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

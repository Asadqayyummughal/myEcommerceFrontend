import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface CategoryItem {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.scss',
})
export class CategoryGrid {
  @Input() categories: any[] = [];

  readonly defaultCategories: CategoryItem[] = [
    { name: 'ELECTRONICS', icon: 'bolt' },
    { name: 'FASHION', icon: 'checkroom' },
    { name: 'HOME', icon: 'home' },
    { name: 'BEAUTY', icon: 'spa' },
    { name: 'SPORTS', icon: 'sports_tennis' },
    { name: 'BOOKS', icon: 'menu_book' },
    { name: 'FOOD', icon: 'local_cafe' },
    { name: 'PHOTOGRAPHY', icon: 'photo_camera' },
  ];
}

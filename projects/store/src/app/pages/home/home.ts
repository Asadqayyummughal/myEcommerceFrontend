import { Component, OnInit } from '@angular/core';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category-service';
import { Product } from '@models/product.model';
import { Category } from '@models/category.model';
import { Hero } from './sections/hero/hero';
import { CategoryGrid } from './sections/category-grid/category-grid';
import { ProductSection } from './sections/product-section/product-section';
import { Newsletter } from './sections/newsletter/newsletter';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, CategoryGrid, ProductSection, Newsletter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  featured: Product[] = [];
  bestSellers: Product[] = [];
  countdownProducts: Product[] = [];
  promotions: Product[] = [];
  newArrivals: Product[] = [];
  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      this.featured = products.slice(0, 3);
      this.bestSellers = products.slice(3, 6);
      this.countdownProducts = products.slice(0, 2);
      this.promotions = products.slice(6, 11);
      this.newArrivals = products.slice(11, 14);
    });

    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: () => {},
    });
  }
}

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '@core/services/product.service';
import { ProductCard } from '@ui/components/product-card/product-card';
import { CategoryService } from '@core/services/category-service';
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
export class Home {
  products = toSignal(inject(ProductService).getProducts(), { initialValue: [] });
  categories = [];
  featured = [];
  bestSellers = [];
  newArrivals = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.categoryService.getCategories().subscribe((res: any) => {
      this.categories = res.data;
    });

    this.productService.getFeaturedProducts().subscribe((res: any) => {
      this.featured = res;
    });

    this.productService.getBestSellers().subscribe((res: any) => {
      this.bestSellers = res;
    });

    this.productService.getNewArrivals().subscribe((res: any) => {
      this.newArrivals = res;
    });
  }
}

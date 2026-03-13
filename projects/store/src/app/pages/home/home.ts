import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category-service';
import { CartService } from '@core/services/cart.service';
import { Product } from '@models/product.model';
import { Category } from '@models/category.model';
import { Hero } from './sections/hero/hero';
import { CategoryGrid } from './sections/category-grid/category-grid';
import { Newsletter } from './sections/newsletter/newsletter';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, Hero, CategoryGrid, Newsletter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  featured: Product[]         = [];
  bestSellers: Product[]      = [];
  flashSaleProducts: Product[] = [];
  promotions: Product[]       = [];
  newArrivals: Product[]      = [];
  categories: Category[]      = [];

  readonly apiUrl = 'http://localhost:3000';

  // ── Countdown (to midnight) ────────────────────────
  countdown = { hours: '00', mins: '00', secs: '00' };
  private countdownId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      this.featured        = products.slice(0, 4);
      this.bestSellers     = products.slice(4, 8);
      this.flashSaleProducts = products.slice(0, 4);
      this.promotions      = products.slice(8, 12);
      this.newArrivals     = products.slice(12, 16);
    });

    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: () => {},
    });

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownId) clearInterval(this.countdownId);
  }

  private startCountdown(): void {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      let diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      diff %= 3600;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      this.countdown = {
        hours: String(h).padStart(2, '0'),
        mins:  String(m).padStart(2, '0'),
        secs:  String(s).padStart(2, '0'),
      };
    };
    tick();
    this.countdownId = setInterval(tick, 1000);
  }

  productImg(product: Product): string {
    const img = (product.images ?? [])[0];
    if (!img) return '';
    return img.startsWith('http') ? img : `${this.apiUrl}/${img}`;
  }

  discountPercent(product: Product): number {
    if (!product.salePrice || !product.price) return 0;
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }

  displayPrice(product: Product): number {
    return product.salePrice ?? product.price ?? 0;
  }

  quickAdd(product: Product): void {
    this.cartService.addToCart(product._id, 1, '').subscribe();
  }

  goToProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }
}

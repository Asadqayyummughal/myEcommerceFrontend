import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '@core/services/product.service';
import { CategoryService } from '@core/services/category-service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { ProductCard } from '@ui/components/product-card/product-card';
import { Product } from '@models/product.model';
import { Category } from '@models/category.model';
import { FrontendCartItem } from '@models/cart.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCard, MatSnackBarModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;

  searchQuery = '';
  selectedCategories: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'createdAt:desc';

  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly limit = 12;

  private searchSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Pre-select filters from URL query params (e.g. coming from home page category click)
    const params = this.route.snapshot.queryParamMap;
    const categoriesParam = params.get('categories');
    if (categoriesParam) {
      this.selectedCategories = categoriesParam.split(',').filter(Boolean);
    }

    this.loadCategories();
    this.loadProducts();
    this.subs.push(
      this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: () => {},
    });
  }

  loadProducts(): void {
    this.loading = true;
    const params: any = { page: this.currentPage, limit: this.limit, sort: this.sortBy };
    if (this.searchQuery.trim()) params.q = this.searchQuery.trim();
    if (this.minPrice != null) params.minPrice = this.minPrice;
    if (this.maxPrice != null) params.maxPrice = this.maxPrice;
    if (this.selectedCategories.length) params.categories = this.selectedCategories.join(',');

    this.subs.push(
      this.productService.listProducts(params).subscribe({
        next: (res) => {
          this.products = res.data.items;
          this.totalPages = res.data.meta.pages;
          this.totalItems = res.data.meta.total;
          this.loading = false;
        },
        error: () => (this.loading = false),
      }),
    );
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  toggleCategory(id: string): void {
    const idx = this.selectedCategories.indexOf(id);
    if (idx === -1) this.selectedCategories.push(id);
    else this.selectedCategories.splice(idx, 1);
    this.currentPage = 1;
    this.loadProducts();
  }

  isCategorySelected(id: string): boolean {
    return this.selectedCategories.includes(id);
  }

  applyPriceFilter(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'createdAt:desc';
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get visiblePages(): number[] {
    const range = 2;
    const pages: number[] = [];
    for (
      let i = Math.max(1, this.currentPage - range);
      i <= Math.min(this.totalPages, this.currentPage + range);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchQuery ||
      this.selectedCategories.length > 0 ||
      this.minPrice != null ||
      this.maxPrice != null
    );
  }

  onQuickAdd(product: Product): void {
    // If product has variants, navigate to detail page to select them
    if (product.variants?.length > 0) {
      this.router.navigate(['/products', product._id]);
      return;
    }
    // No variants — add directly to cart
    if (this.authService.isLoggedIn) {
      this.cartService.addToCart(product._id, 1, '').subscribe({
        next: () => {
          this.cartService.loadAuthCart();
          this.snackBar.open('Added to cart!', 'View', { duration: 2500 })
            .onAction().subscribe(() => this.cartService.openDrawer());
        },
        error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not add to cart', 'Close', { duration: 3000 }),
      });
    } else {
      const item: FrontendCartItem = {
        productId: product._id,
        title: product.title,
        image: product.images?.[0] ?? '',
        variantSku: '',
        variantLabel: '',
        price: product.salePrice ?? product.price,
        quantity: 1,
      };
      this.cartService.addGuestItem(item);
      this.snackBar.open('Added to cart!', 'View Cart', { duration: 2500 })
        .onAction().subscribe(() => this.cartService.openDrawer());
    }
  }
}

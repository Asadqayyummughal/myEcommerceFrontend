import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { CartService } from '@core/services/cart.service';
import { ProductCard } from '@ui/components/product-card/product-card';

type StoreTab = 'items' | 'about';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCard],
  templateUrl: './store-detail.html',
})
export class StoreDetail implements OnInit {
  storeId = '';
  store: any = null;
  allProducts: any[] = [];
  filteredProducts: any[] = [];

  loading = true;
  loadingProducts = true;
  error = '';

  activeTab: StoreTab = 'items';
  searchQuery = '';
  sortBy = 'newest';

  readonly apiUrl = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.storeId) { this.error = 'Store not found.'; this.loading = false; return; }
    this.loadStore();
    this.loadProducts();
  }

  private loadStore(): void {
    this.api.get<any>(`vendor/store/${this.storeId}`).subscribe({
      next: (res) => {
        this.store = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load store.';
        this.loading = false;
      },
    });
  }

  private loadProducts(): void {
    this.api.get<any>(`vendor/store/${this.storeId}/products`).subscribe({
      next: (res) => {
        this.allProducts = res.data?.products ?? res.data ?? res.products ?? res ?? [];
        this.applyFilters();
        this.loadingProducts = false;
      },
      error: () => {
        this.allProducts = [];
        this.loadingProducts = false;
      },
    });
  }

  applyFilters(): void {
    let result = [...this.allProducts];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (this.sortBy === 'price_asc')  result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (this.sortBy === 'price_desc') result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (this.sortBy === 'newest')     result.sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );

    this.filteredProducts = result;
  }

  onSearchChange(): void { this.applyFilters(); }
  onSortChange(): void   { this.applyFilters(); }
  setTab(tab: StoreTab): void { this.activeTab = tab; }

  navigateToProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  onQuickAdd(product: any): void {
    this.cartService.addToCart(product._id, 1, '').subscribe();
  }

  imageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.apiUrl}/${path}`;
  }

  get memberSince(): string {
    if (!this.store?.createdAt) return '';
    return new Date(this.store.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get activeProductCount(): number {
    return this.allProducts.filter(p => p.isActive !== false).length;
  }
}

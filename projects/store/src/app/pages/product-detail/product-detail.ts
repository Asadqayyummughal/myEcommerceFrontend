import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { WishlistService } from '@core/services/wishlist.service';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { Product, IProductVariant } from '@models/product.model';
import { ProductReview } from '@models/review.model';
import { FrontendCartItem, GuestWishlistItem } from '@models/cart.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  reviews: ProductReview[] = [];
  loading = true;
  reviewsLoading = false;
  addingToCart = false;
  wishlistLoading = false;
  errorMessage = '';

  activeImageIndex = 0;
  quantity = 1;
  selectedAttributes: Record<string, string> = {};
  selectedVariant: IProductVariant | null = null;

  readonly apiUrl = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadProduct(id);
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (res: any) => {
        this.product = res.data ?? res;
        this.loading = false;
        this.loadReviews(id);
      },
      error: () => {
        this.errorMessage = 'Product not found.';
        this.loading = false;
      },
    });
  }

  loadReviews(productId: string): void {
    if (!this.authService.isLoggedIn) return;
    this.reviewsLoading = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.reviewsLoading = false;
      },
      error: () => (this.reviewsLoading = false),
    });
  }

  // ── Image gallery ──────────────────────────────
  get allImages(): string[] {
    const base = this.product?.images ?? [];
    const variantImgs = this.selectedVariant?.images ?? [];
    return [...new Set([...variantImgs, ...base])];
  }

  setImage(index: number): void {
    this.activeImageIndex = index;
  }

  get activeImage(): string {
    const imgs = this.allImages;
    return imgs.length > 0 ? this.apiUrl + imgs[this.activeImageIndex] : 'placeholderImage.jpg';
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }

  // ── Variants ───────────────────────────────────
  get attributeKeys(): string[] {
    const keys = new Set<string>();
    this.product?.variants.forEach((v) =>
      Object.keys(v.attributes ?? {}).forEach((k) => keys.add(k)),
    );
    return Array.from(keys);
  }

  getAttributeValues(key: string): string[] {
    const values = new Set<string>();
    this.product?.variants.forEach((v) => {
      if (v.attributes?.[key]) values.add(v.attributes[key]);
    });
    return Array.from(values);
  }

  selectAttribute(key: string, value: string): void {
    this.selectedAttributes = { ...this.selectedAttributes, [key]: value };
    this.selectedVariant =
      this.product?.variants.find((v) =>
        Object.entries(this.selectedAttributes).every(([k, val]) => v.attributes?.[k] === val),
      ) ?? null;
    this.activeImageIndex = 0;
  }

  isAttributeSelected(key: string, value: string): boolean {
    return this.selectedAttributes[key] === value;
  }

  get hasVariants(): boolean {
    return (this.product?.variants.length ?? 0) > 0;
  }

  get allAttributesSelected(): boolean {
    return this.attributeKeys.every((k) => !!this.selectedAttributes[k]);
  }

  // ── Price ──────────────────────────────────────
  get displayPrice(): number {
    return this.selectedVariant?.price ?? this.product?.salePrice ?? this.product?.price ?? 0;
  }

  get originalPrice(): number | null {
    if (this.selectedVariant?.price) return this.product?.price ?? null;
    return this.product?.salePrice ? this.product.price : null;
  }

  get discountPercent(): number {
    if (!this.originalPrice || !this.displayPrice) return 0;
    return Math.round(((this.originalPrice - this.displayPrice) / this.originalPrice) * 100);
  }

  // ── Stock ──────────────────────────────────────
  get availableStock(): number {
    if (this.selectedVariant)
      return this.selectedVariant.stock - this.selectedVariant.reservedStock;
    return (this.product?.stock ?? 0) - (this.product?.reservedStock ?? 0);
  }

  get inStock(): boolean {
    return this.availableStock > 0;
  }

  changeQty(delta: number): void {
    const next = this.quantity + delta;
    if (next >= 1 && next <= this.availableStock) this.quantity = next;
  }

  // ── Cart ───────────────────────────────────────
  get canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.hasVariants && !this.allAttributesSelected) return false;
    return this.inStock;
  }

  addToCart(): void {
    if (!this.canAddToCart) return;

    if (!this.authService.isLoggedIn) {
      // Guest flow: save to localStorage
      const variantLabel = Object.entries(this.selectedAttributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');
      const item: FrontendCartItem = {
        productId: this.product!._id,
        title: this.product!.title,
        image: this.allImages[0] ?? '',
        variantSku: this.selectedVariant?.sku ?? '',
        variantLabel,
        price: this.displayPrice,
        quantity: this.quantity,
      };
      this.cartService.addGuestItem(item);
      this.snackBar.open('Added to cart!', 'View Cart', { duration: 3000 })
        .onAction().subscribe(() => this.cartService.openDrawer());
      return;
    }

    this.addingToCart = true;
    const sku = this.selectedVariant?.sku ?? '';
    this.cartService.addToCart(this.product!._id, this.quantity, sku).subscribe({
      next: () => {
        this.cartService.loadAuthCart();
        this.addingToCart = false;
        this.snackBar.open('Added to cart!', 'View Cart', { duration: 3000 })
          .onAction().subscribe(() => this.cartService.openDrawer());
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message ?? 'Could not add to cart', 'Close', { duration: 3000 });
        this.addingToCart = false;
      },
    });
  }

  // ── Wishlist ───────────────────────────────────
  get inWishlistCurrent(): boolean {
    return this.wishlistService.isInWishlist(this.product?._id ?? '');
  }

  toggleWishlist(): void {
    if (!this.product) return;

    if (!this.authService.isLoggedIn) {
      // Guest flow
      const item: GuestWishlistItem = {
        productId: this.product._id,
        title: this.product.title,
        image: this.allImages[0] ?? '',
        price: this.displayPrice,
      };
      this.wishlistService.toggleGuest(item);
      const added = this.wishlistService.isInWishlist(this.product._id);
      this.snackBar.open(added ? 'Saved to wishlist' : 'Removed from wishlist', '✓', { duration: 2000 });
      return;
    }

    this.wishlistLoading = true;
    this.wishlistService.toggle(this.product._id).subscribe({
      next: () => (this.wishlistLoading = false),
      error: () => (this.wishlistLoading = false),
    });
  }

  // ── Reviews ────────────────────────────────────
  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getStarType(star: number, rating: number): string {
    if (star <= Math.floor(rating)) return 'star';
    if (star - rating < 1 && rating % 1 >= 0.5) return 'star_half';
    return 'star_border';
  }
}

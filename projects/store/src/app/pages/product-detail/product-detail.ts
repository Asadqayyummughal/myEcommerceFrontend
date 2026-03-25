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
import { ApiService } from '@core/services/api.service';
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

  // ── Review: write form ─────────────────────────────────
  reviewForm = { rating: 0, comment: '' };
  hoverRating = 0;
  submittingReview = false;
  reviewError = '';
  reviewSuccess = '';

  // ── Review: edit form ──────────────────────────────────
  editingReviewId = '';
  editForm = { rating: 0, comment: '' };
  editHoverRating = 0;
  updatingReview = false;

  // ── Review: eligible delivered orders ─────────────────
  eligibleOrderId = ''; // auto-selected order id
  loadingOrders = false;
  ordersChecked = false; // true after the check is done

  // ── Review: pagination ────────────────────────────────
  reviewPage = 1;
  reviewTotalPages = 1;
  loadingMoreReviews = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    public authService: AuthService,
    private api: ApiService,
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
        if (this.authService.isLoggedIn) {
          this.loadReviews(id);
          this.checkEligibleOrder(id);
        }
      },
      error: () => {
        this.errorMessage = 'Product not found.';
        this.loading = false;
      },
    });
  }

  loadReviews(productId: string, page = 1): void {
    if (page === 1) {
      this.reviewsLoading = true;
      this.reviews = [];
    } else {
      this.loadingMoreReviews = true;
    }

    this.reviewService.getProductReviews(productId, page, 5).subscribe({
      next: (res) => {
        this.reviews = page === 1 ? res.data : [...this.reviews, ...res.data];
        this.reviewPage = res.pagination?.pageNo ?? page;
        this.reviewTotalPages = res.pagination?.totalPages ?? 1;
        this.reviewsLoading = false;
        this.loadingMoreReviews = false;
      },
      error: () => {
        this.reviewsLoading = false;
        this.loadingMoreReviews = false;
      },
    });
  }

  loadMoreReviews(): void {
    if (!this.product || this.reviewPage >= this.reviewTotalPages) return;
    this.loadReviews(this.product._id, this.reviewPage + 1);
  }

  /** Finds first delivered order that contains this product — used as orderId when submitting a review */
  private checkEligibleOrder(productId: string): void {
    this.loadingOrders = true;
    this.api.get<any>('order').subscribe({
      next: (res) => {
        const orders: any[] = res.data ?? res.orders ?? res ?? [];
        const eligible = orders.find(
          (o: any) =>
            o.status === 'delivered' &&
            o.items?.some((item: any) => (item.product?._id ?? item.product) === productId),
        );
        this.eligibleOrderId = eligible?._id ?? '';
        this.loadingOrders = false;
        this.ordersChecked = true;
      },
      error: () => {
        this.loadingOrders = false;
        this.ordersChecked = true;
      },
    });
  }

  // ── Image gallery ──────────────────────────────────────
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

  // ── Variants ──────────────────────────────────────────
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

  // ── Price ─────────────────────────────────────────────
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

  // ── Stock ─────────────────────────────────────────────
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

  // ── Cart ──────────────────────────────────────────────
  get canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.hasVariants && !this.allAttributesSelected) return false;
    return this.inStock;
  }

  addToCart(): void {
    if (!this.canAddToCart) return;

    if (!this.authService.isLoggedIn) {
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
      this.snackBar
        .open('Added to cart!', 'View Cart', { duration: 3000 })
        .onAction()
        .subscribe(() => this.cartService.openDrawer());
      return;
    }

    this.addingToCart = true;
    const sku = this.selectedVariant?.sku ?? '';
    this.cartService.addToCart(this.product!._id, this.quantity, sku).subscribe({
      next: () => {
        this.cartService.loadAuthCart();
        this.addingToCart = false;
        this.snackBar
          .open('Added to cart!', 'View Cart', { duration: 3000 })
          .onAction()
          .subscribe(() => this.cartService.openDrawer());
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message ?? 'Could not add to cart', 'Close', {
          duration: 3000,
        });
        this.addingToCart = false;
      },
    });
  }

  // ── Wishlist ───────────────────────────────────────────
  get inWishlistCurrent(): boolean {
    return this.wishlistService.isInWishlist(this.product?._id ?? '');
  }

  toggleWishlist(): void {
    if (!this.product) return;
    if (!this.authService.isLoggedIn) {
      const item: GuestWishlistItem = {
        productId: this.product._id,
        title: this.product.title,
        image: this.allImages[0] ?? '',
        price: this.displayPrice,
      };
      this.wishlistService.toggleGuest(item);
      const added = this.wishlistService.isInWishlist(this.product._id);
      this.snackBar.open(added ? 'Saved to wishlist' : 'Removed from wishlist', '✓', {
        duration: 2000,
      });
      return;
    }
    this.wishlistLoading = true;
    this.wishlistService.toggle(this.product._id).subscribe({
      next: () => (this.wishlistLoading = false),
      error: () => (this.wishlistLoading = false),
    });
  }

  // ── 3D Image hover ────────────────────────────────────
  imageTransform = '';

  onImageMouseMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const rotateY = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 12;
    const rotateX = -((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 12;
    this.imageTransform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  }

  onImageMouseLeave(): void {
    this.imageTransform = '';
  }

  // ── Reviews: helpers ──────────────────────────────────
  readonly ratingStars = [1, 2, 3, 4, 5];

  getStarType(star: number, rating: number): string {
    if (star <= Math.floor(rating)) return 'star';
    if (star - rating < 1 && rating % 1 >= 0.5) return 'star_half';
    return 'star_border';
  }

  get myReview(): ProductReview | undefined {
    const userId = this.authService.currentUser?.id;
    if (!userId) return undefined;
    return this.reviews.find(
      (r) => (r.user as any)?._id === userId || (r.user as any)?.id === userId,
    );
  }

  get ratingBreakdown(): { star: number; count: number; percent: number }[] {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = this.reviews.filter((r) => Math.round(r.rating) === star).length;
      const percent = this.reviews.length ? Math.round((count / this.reviews.length) * 100) : 0;
      return { star, count, percent };
    });
  }

  get averageRating(): number {
    return Number(this.product?.averageRating ?? 0);
  }

  // ── Reviews: write ────────────────────────────────────
  setReviewRating(r: number): void {
    this.reviewForm.rating = r;
  }
  setHoverRating(r: number): void {
    this.hoverRating = r;
  }
  clearHover(): void {
    this.hoverRating = 0;
  }

  get displayRating(): number {
    return this.hoverRating || this.reviewForm.rating;
  }

  submitReview(): void {
    if (!this.product || !this.eligibleOrderId || this.reviewForm.rating === 0) return;
    this.submittingReview = true;
    this.reviewError = '';
    this.reviewSuccess = '';

    this.reviewService
      .createReview({
        orderId: this.eligibleOrderId,
        productId: this.product._id,
        rating: this.reviewForm.rating,
        comment: this.reviewForm.comment.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.reviewSuccess = 'Review submitted! It will appear after approval.';
          this.reviewForm = { rating: 0, comment: '' };
          this.submittingReview = false;
          this.loadReviews(this.product!._id);
        },
        error: (err: any) => {
          this.reviewError = err?.error?.message ?? 'Failed to submit review.';
          this.submittingReview = false;
        },
      });
  }

  // ── Reviews: edit ─────────────────────────────────────
  startEdit(review: ProductReview): void {
    this.editingReviewId = review._id;
    this.editForm = { rating: review.rating, comment: review.comment ?? '' };
    this.editHoverRating = 0;
  }

  cancelEdit(): void {
    this.editingReviewId = '';
  }

  setEditHover(r: number): void {
    this.editHoverRating = r;
  }
  clearEditHover(): void {
    this.editHoverRating = 0;
  }
  setEditRating(r: number): void {
    this.editForm.rating = r;
  }
  get displayEditRating(): number {
    return this.editHoverRating || this.editForm.rating;
  }

  saveEdit(): void {
    if (!this.editingReviewId || this.editForm.rating === 0) return;
    this.updatingReview = true;
    this.reviewService
      .updateReview(this.editingReviewId, {
        rating: this.editForm.rating,
        comment: this.editForm.comment.trim(),
      })
      .subscribe({
        next: () => {
          this.updatingReview = false;
          this.editingReviewId = '';
          this.loadReviews(this.product!._id);
          this.snackBar.open('Review updated!', '✓', { duration: 2500 });
        },
        error: (err: any) => {
          this.updatingReview = false;
          this.snackBar.open(err?.error?.message ?? 'Could not update review.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  // ── Reviews: delete ───────────────────────────────────
  confirmDelete(reviewId: string): void {
    if (!confirm('Delete your review?')) return;
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.loadReviews(this.product!._id);
        this.snackBar.open('Review deleted.', '✓', { duration: 2500 });
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Could not delete review.', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}

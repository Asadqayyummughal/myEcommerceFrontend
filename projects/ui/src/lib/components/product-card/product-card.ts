import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@models/product.model';
import { WishlistService } from '@core/services/wishlist.service';
import { GuestWishlistItem } from '@models/cart.model';

@Component({
  selector: 'lib-product-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  standalone: true,
})
export class ProductCard {
  @Input() product!: Product;
  @Output() quickAddToCart = new EventEmitter<Product>();

  wishlistService = inject(WishlistService);
  public apiUrl = 'http://localhost:3000';

  get discountPercentage(): number {
    if (!this.product.discountPrice) return 0;
    return Math.round(
      ((this.product.price - this.product.discountPrice) / this.product.price) * 100,
    );
  }

  get inWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product._id);
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const item: GuestWishlistItem = {
      productId: this.product._id,
      title: this.product.title,
      image: this.product.images?.[0] ?? '',
      price: this.product.salePrice ?? this.product.price,
    };
    this.wishlistService.toggleGuest(item);
  }

  onQuickAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickAddToCart.emit(this.product);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }
}

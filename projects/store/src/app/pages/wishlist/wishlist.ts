import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '@core/services/wishlist.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { GuestWishlistItem } from '@models/cart.model';

interface WishlistDisplayItem {
  productId: string;
  title: string;
  image: string;
  price: number;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './wishlist.html',
})
export class Wishlist implements OnInit {
  items: WishlistDisplayItem[] = [];
  loading = false;

  readonly apiUrl = 'http://localhost:3000';

  constructor(
    public wishlistService: WishlistService,
    public cartService: CartService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.loadAuthWishlist();
    } else {
      this.loadGuestWishlist();
    }
  }

  private loadAuthWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.items = (res?.data ?? []).map((i: any) => ({
          productId: i.productId ?? i.product?._id ?? i._id ?? '',
          title: i.title ?? i.product?.title ?? '',
          image: i.image ?? i.product?.images?.[0] ?? '',
          price: i.price ?? i.product?.salePrice ?? i.product?.price ?? 0,
        }));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadGuestWishlist(): void {
    this.wishlistService.guestItems$.subscribe((items) => {
      this.items = items;
    });
  }

  removeItem(productId: string): void {
    if (this.authService.isLoggedIn) {
      this.wishlistService.toggle(productId).subscribe({
        next: () => {
          this.items = this.items.filter((i) => i.productId !== productId);
          this.snackBar.open('Removed from wishlist', '✓', { duration: 2000 });
        },
      });
    } else {
      this.wishlistService.removeGuestItem(productId);
      this.items = this.items.filter((i) => i.productId !== productId);
      this.snackBar.open('Removed from wishlist', '✓', { duration: 2000 });
    }
  }

  moveToCart(item: WishlistDisplayItem): void {
    if (this.authService.isLoggedIn) {
      this.cartService.addToCart(item.productId, 1, '').subscribe({
        next: () => {
          this.snackBar.open('Added to cart!', '✓', { duration: 2500, panelClass: ['snack-success'] });
          this.cartService.loadAuthCart();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message ?? 'Could not add to cart', 'Close', { duration: 3000 });
        },
      });
    } else {
      const guestItem: GuestWishlistItem = {
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
      };
      this.cartService.addGuestItem({
        productId: item.productId,
        title: item.title,
        image: item.image,
        variantSku: '',
        variantLabel: '',
        price: item.price,
        quantity: 1,
      });
      this.snackBar.open('Added to cart!', 'View', { duration: 2500 }).onAction().subscribe(() => {
        this.cartService.openDrawer();
      });
    }
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }
}

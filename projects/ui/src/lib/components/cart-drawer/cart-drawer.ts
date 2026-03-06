import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { FrontendCartItem } from '@models/cart.model';

@Component({
  selector: 'lib-cart-drawer',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './cart-drawer.html',
})
export class CartDrawer {
  cartService = inject(CartService);
  authService = inject(AuthService);

  readonly apiUrl = 'http://localhost:3000';

  get subtotal(): number {
    return this.cartService.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  decreaseQty(item: FrontendCartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }
    if (this.authService.isLoggedIn) {
      this.cartService
        .updateCartItem(item.productId, item.quantity - 1, item.variantSku)
        .subscribe({ next: () => this.cartService.loadAuthCart() });
    } else {
      this.cartService.updateGuestQty(item.productId, item.variantSku, item.quantity - 1);
    }
  }

  increaseQty(item: FrontendCartItem): void {
    if (this.authService.isLoggedIn) {
      this.cartService
        .updateCartItem(item.productId, item.quantity + 1, item.variantSku)
        .subscribe({ next: () => this.cartService.loadAuthCart() });
    } else {
      this.cartService.updateGuestQty(item.productId, item.variantSku, item.quantity + 1);
    }
  }

  removeItem(item: FrontendCartItem): void {
    if (this.authService.isLoggedIn) {
      this.cartService
        .removeCartItem(item.productId, item.variantSku)
        .subscribe({ next: () => this.cartService.loadAuthCart() });
    } else {
      this.cartService.removeGuestItem(item.productId, item.variantSku);
    }
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }
}

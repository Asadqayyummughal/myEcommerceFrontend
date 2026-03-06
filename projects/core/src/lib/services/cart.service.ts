import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private api: ApiService) {}

  addToCart(productId: string, quantity: number, variantSku: string): Observable<any> {
    return this.api.post('cart/add', { productId, quantity, variantSku });
  }

  getCart(): Observable<any> {
    return this.api.get('cart');
  }

  updateCartItem(productId: string, quantity: number, variantSku: string): Observable<any> {
    return this.api.put('cart/update', { productId, quantity, variantSku });
  }

  removeCartItem(productId: string, variantSku: string): Observable<any> {
    return this.api.delete(`cart/remove?productId=${productId}&variantSku=${variantSku}`);
  }
}

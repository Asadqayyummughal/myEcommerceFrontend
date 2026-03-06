import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private api: ApiService) {}

  toggle(productId: string): Observable<any> {
    return this.api.post('wishlist', { productId });
  }

  getWishlist(): Observable<any> {
    return this.api.get('wishlist');
  }
}

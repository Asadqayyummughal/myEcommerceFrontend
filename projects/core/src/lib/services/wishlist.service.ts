import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GuestWishlistItem } from '@models/cart.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly GUEST_KEY = 'guest_wishlist';

  /** Set of productIds currently in wishlist (works for both guest & auth) */
  private idsSubject = new BehaviorSubject<Set<string>>(this.loadGuestIds());
  wishlistIds$ = this.idsSubject.asObservable();

  /** Full item objects (guest only – auth uses API response) */
  private guestItemsSubject = new BehaviorSubject<GuestWishlistItem[]>(this.loadGuestItems());
  guestItems$ = this.guestItemsSubject.asObservable();

  constructor(private api: ApiService) {}

  get count(): number {
    return this.idsSubject.value.size;
  }

  get hasGuestItems(): boolean {
    return this.loadGuestItems().length > 0;
  }

  isInWishlist(productId: string): boolean {
    return this.idsSubject.value.has(productId);
  }

  // ── Guest wishlist ──────────────────────────────────
  addGuestItem(item: GuestWishlistItem): void {
    const items = this.loadGuestItems();
    if (!items.find((i) => i.productId === item.productId)) {
      items.push(item);
      this.saveGuestItems(items);
    }
  }

  removeGuestItem(productId: string): void {
    const items = this.loadGuestItems().filter((i) => i.productId !== productId);
    this.saveGuestItems(items);
  }

  toggleGuest(item: GuestWishlistItem): void {
    if (this.isInWishlist(item.productId)) {
      this.removeGuestItem(item.productId);
    } else {
      this.addGuestItem(item);
    }
  }

  clearGuestWishlist(): void {
    this.saveGuestItems([]);
  }

  // ── Auth wishlist (API) ─────────────────────────────
  toggle(productId: string): Observable<any> {
    return this.api.post('wishlist', { productId }).pipe(
      tap(() => {
        const ids = new Set(this.idsSubject.value);
        if (ids.has(productId)) {
          ids.delete(productId);
        } else {
          ids.add(productId);
        }
        this.idsSubject.next(ids);
      }),
    );
  }

  getWishlist(): Observable<any> {
    return this.api.get('wishlist');
  }

  /** Called after login: loads user wishlist from API, sets local id set */
  loadAuthWishlist(): void {
    this.getWishlist().subscribe({
      next: (res) => {
        const ids = new Set<string>(
          (res?.data ?? []).map((i: any) => i.productId ?? i.product?._id ?? i._id ?? ''),
        );
        this.idsSubject.next(ids);
      },
    });
  }

  /** Merge guest wishlist items into backend wishlist */
  syncGuestWishlist(): Observable<any> {
    const guestItems = this.loadGuestItems();
    const productIds = guestItems.map((i) => i.productId);
    return this.api.post('wishlist/sync', { productIds }).pipe(
      tap(() => this.clearGuestWishlist()),
    );
  }

  private saveGuestItems(items: GuestWishlistItem[]): void {
    this.guestItemsSubject.next(items);
    const ids = new Set(items.map((i) => i.productId));
    this.idsSubject.next(ids);
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(items));
  }

  private loadGuestItems(): GuestWishlistItem[] {
    try {
      const raw = localStorage.getItem(this.GUEST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadGuestIds(): Set<string> {
    return new Set(this.loadGuestItems().map((i) => i.productId));
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { FrontendCartItem } from '@models/cart.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly GUEST_KEY = 'guest_cart';

  private itemsSubject = new BehaviorSubject<FrontendCartItem[]>(this.loadGuestCart());
  items$ = this.itemsSubject.asObservable();

  drawerOpen = false;

  constructor(private api: ApiService) {}

  get totalCount(): number {
    return this.itemsSubject.value.reduce((sum, i) => sum + i.quantity, 0);
  }

  get items(): FrontendCartItem[] {
    return this.itemsSubject.value;
  }

  openDrawer(): void {
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }

  // ── Guest cart (localStorage) ───────────────────────
  addGuestItem(item: FrontendCartItem): void {
    const current = [...this.itemsSubject.value];
    const idx = current.findIndex(
      (i) => i.productId === item.productId && i.variantSku === item.variantSku,
    );
    if (idx >= 0) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + item.quantity };
    } else {
      current.push(item);
    }
    this.setGuestCart(current);
  }

  updateGuestQty(productId: string, variantSku: string, quantity: number): void {
    const current = this.itemsSubject.value.map((i) =>
      i.productId === productId && i.variantSku === variantSku ? { ...i, quantity } : i,
    );
    this.setGuestCart(current);
  }

  removeGuestItem(productId: string, variantSku: string): void {
    const current = this.itemsSubject.value.filter(
      (i) => !(i.productId === productId && i.variantSku === variantSku),
    );
    this.setGuestCart(current);
  }

  clearGuestCart(): void {
    this.setGuestCart([]);
  }

  // ── Auth cart (API) ─────────────────────────────────
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

  /** Called after login: merges localStorage guest cart into backend cart */
  syncGuestCart(): Observable<any> {
    const guestItems = this.loadGuestCart();
    const items = guestItems.map((i) => ({
      productId: i.productId,
      variantSku: i.variantSku,
      quantity: i.quantity,
    }));
    return this.api.post('cart/sync', { items }).pipe(
      tap(() => this.clearGuestCart()),
    );
  }

  /** Load backend cart items into the local subject (for auth users) */
  loadAuthCart(): void {
    this.getCart().subscribe({
      next: (res) => {
        if (res?.data?.items) {
          const mapped: FrontendCartItem[] = res.data.items.map((i: any) => ({
            productId: i.productId ?? i.product?._id ?? '',
            title: i.title ?? i.product?.title ?? '',
            image: i.image ?? i.product?.images?.[0] ?? '',
            variantSku: i.variantSku ?? '',
            variantLabel: i.variantLabel ?? '',
            price: i.price ?? 0,
            quantity: i.quantity,
          }));
          this.itemsSubject.next(mapped);
        }
      },
    });
  }

  private setGuestCart(items: FrontendCartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(items));
  }

  private loadGuestCart(): FrontendCartItem[] {
    try {
      const raw = localStorage.getItem(this.GUEST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

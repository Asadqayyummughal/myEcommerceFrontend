import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';

export interface AuthRole {
  _id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: AuthRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'auth_user';
  private readonly ACCESS_KEY = 'auth_access_token';
  private readonly REFRESH_KEY = 'auth_refresh_token';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  /** Fires when the session expires — subscribe in App to redirect */
  readonly sessionExpired$ = new Subject<void>();

  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private wishlistService: WishlistService,
  ) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser && !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  // ── Auto-logout ────────────────────────────────────────────────────
  scheduleAutoLogout(): void {
    const token = this.getAccessToken();
    if (!token) return;

    const expiry = this.getTokenExpiry(token);
    if (!expiry) return;

    const msUntilExpiry = expiry - Date.now();

    if (msUntilExpiry <= 0) {
      this.clearSession();
      this.sessionExpired$.next();
      return;
    }

    this.clearLogoutTimer();
    this.logoutTimer = setTimeout(() => {
      this.clearSession();
      this.sessionExpired$.next();
    }, msUntilExpiry);
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer !== null) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  // ── Auth API ───────────────────────────────────────────────────────
  signup(name: string, email: string, password: string): Observable<any> {
    return this.api.post('auth/signup', { name, email, password });
  }

  /**
   * Login → store tokens → fetch full profile via getUserProfile()
   * → store complete AuthUser (with populated role object).
   * Callers receive the original login response; currentUser is already
   * set by the time the observable completes.
   */
  login(email: string, password: string): Observable<any> {
    return this.api.post<any>('auth/login', { email, password }).pipe(
      switchMap((res) => {
        if (!res.success) return of(res);

        // Store tokens first so the auth interceptor can attach them
        localStorage.setItem(this.ACCESS_KEY, res.data.accessToken);
        localStorage.setItem(this.REFRESH_KEY, res.data.refreshToken);
        this.scheduleAutoLogout();

        // Fetch the full profile to get the populated role object
        return this.getUserProfile().pipe(
          tap((profileRes: any) => {
            const user = this.mapProfileToUser(profileRes.data ?? profileRes);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.currentUserSubject.next(user);
            this.onLoginSuccess();
          }),
          map(() => res),
        );
      }),
    );
  }

  getUserProfile(): Observable<any> {
    return this.api.get('users/profile');
  }

  /** Re-fetch profile and overwrite the stored user (useful on app startup). */
  refreshUserFromProfile(): Observable<any> {
    return this.getUserProfile().pipe(
      tap((res: any) => {
        const user = this.mapProfileToUser(res.data ?? res);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post('auth/forgotPassword', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.api.post(`auth/resetPassword/${token}`, { newPassword });
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    return this.api.post('auth/logout', { refreshToken }).pipe(tap(() => this.clearSession()));
  }

  clearSession(): void {
    this.clearLogoutTimer();
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUserSubject.next(null);
    this.cartService.clearGuestCart();
    this.wishlistService.clearGuestWishlist();
  }

  // ── Private helpers ────────────────────────────────────────────────
  private mapProfileToUser(p: any): AuthUser {
    const roleRaw = p.role;
    const role: AuthRole =
      typeof roleRaw === 'object' && roleRaw !== null
        ? { _id: String(roleRaw._id ?? ''), name: roleRaw.name ?? '' }
        : { _id: '', name: String(roleRaw ?? '') };

    return {
      id:    p._id ?? p.id ?? '',
      name:  p.name ?? '',
      email: p.email ?? '',
      phone: p.phone ?? '',
      image: p.image ?? '',
      role,
    };
  }

  private onLoginSuccess(): void {
    const guestCart = this.cartService.items;
    if (guestCart.length > 0) {
      this.cartService.syncGuestCart().subscribe({
        next: () => this.cartService.loadAuthCart(),
        error: () => this.cartService.loadAuthCart(),
      });
    } else {
      this.cartService.loadAuthCart();
    }
    if (this.wishlistService.hasGuestItems) {
      this.wishlistService.syncGuestWishlist().subscribe({
        next: () => this.wishlistService.loadAuthWishlist(),
        error: () => this.wishlistService.loadAuthWishlist(),
      });
    } else {
      this.wishlistService.loadAuthWishlist();
    }
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

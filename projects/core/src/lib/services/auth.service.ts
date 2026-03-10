import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
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

  /** Fires when the session expires automatically — subscribe in App to redirect */
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

  // ── Auto-logout ─────────────────────────────────────
  /**
   * Decodes the JWT exp claim and schedules automatic logout.
   * Call this on login and on app startup when a session already exists.
   */
  scheduleAutoLogout(): void {
    const token = this.getAccessToken();
    if (!token) return;

    const expiry = this.getTokenExpiry(token);
    if (!expiry) return;

    const msUntilExpiry = expiry - Date.now();

    if (msUntilExpiry <= 0) {
      // Token already expired — clear immediately
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

  // ── Auth API ────────────────────────────────────────
  signup(name: string, email: string, password: string): Observable<any> {
    return this.api.post('auth/signup', { name, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.api.post<any>('auth/login', { email, password }).pipe(
      tap((res) => {
        if (res.success) {
          this.storeSession(res.data.user, res.data.accessToken, res.data.refreshToken);
          this.scheduleAutoLogout();
          this.onLoginSuccess();
        }
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

  // ── Private helpers ─────────────────────────────────
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

  private storeSession(user: AuthUser, accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ACCESS_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  getUserProfile(): Observable<any> {
    return this.api.get('users/profile');
  }

  /** Fetch profile from API and overwrite the stored user object. */
  refreshUserFromProfile(): Observable<any> {
    return this.getUserProfile().pipe(
      tap((res: any) => {
        const p = res.data ?? res;
        const updated: AuthUser = {
          id:    p._id ?? p.id ?? this.currentUser?.id ?? '',
          name:  p.name  ?? this.currentUser?.name  ?? '',
          email: p.email ?? this.currentUser?.email ?? '',
          role:  typeof p.role === 'object' ? p.role?.name : (p.role ?? this.currentUser?.role ?? ''),
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
        this.currentUserSubject.next(updated);
      }),
    );
  }
}

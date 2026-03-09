import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private expirySub!: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 1. Restore saved theme preference (dark / light)
    this.themeService.init();

    // 2. If user is already logged in (page refresh), load their cart
    //    and restart the auto-logout timer from the stored token's expiry
    if (this.authService.isLoggedIn) {
      this.cartService.loadAuthCart();
      this.authService.scheduleAutoLogout();
    }

    // 3. When the timer fires, redirect to login with a message
    this.expirySub = this.authService.sessionExpired$.subscribe(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: { reason: 'session_expired' },
      });
    });
  }

  ngOnDestroy(): void {
    this.expirySub?.unsubscribe();
  }
}

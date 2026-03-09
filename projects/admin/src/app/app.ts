import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App implements OnInit {
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.themeService.init();
    if (this.authService.isLoggedIn) {
      this.authService.scheduleAutoLogout();
    }
    this.authService.sessionExpired$.subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

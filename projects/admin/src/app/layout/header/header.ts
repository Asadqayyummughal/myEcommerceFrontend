import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.html',
})
export class AdminHeader {
  readonly toggleSidebar = output<void>();

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}

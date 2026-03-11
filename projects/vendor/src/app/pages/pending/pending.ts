import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './pending.html',
})
export class Pending {
  constructor(public authService: AuthService) {}
}

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../sidebar/sidebar';
import { AdminHeader } from '../header/header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AdminSidebar, AdminHeader],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}

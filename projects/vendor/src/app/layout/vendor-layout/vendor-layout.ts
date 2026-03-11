import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendorSidebar } from '../sidebar/sidebar';
import { VendorHeader } from '../header/header';

@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, VendorSidebar, VendorHeader],
  templateUrl: './vendor-layout.html',
})
export class VendorLayout {
  sidebarCollapsed = signal(false);
  mobileOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.mobileOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }
}

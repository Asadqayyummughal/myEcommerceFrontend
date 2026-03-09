import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';

  /** Reactive signal — read this in templates for conditional classes */
  isDark = signal(false);

  /** Call once at app startup to restore saved preference */
  init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark =
      saved !== null ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDark.set(prefersDark);
    this.applyClass(prefersDark);
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(this.STORAGE_KEY, next ? 'dark' : 'light');
    this.applyClass(next);
  }

  private applyClass(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}

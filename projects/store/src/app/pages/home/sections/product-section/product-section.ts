import { Component, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@models/product.model';
import { environment } from 'projects/core/src/environments/environment';
@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './product-section.html',
  styleUrl: './product-section.scss',
})
export class ProductSection implements OnInit, OnDestroy {
  readonly title = input<string>('');
  readonly products = input<Product[]>([]);
  readonly variant = input<'grid' | 'countdown' | 'promotions' | 'banner'>('grid');
  hours = 3;
  minutes = 45;
  seconds = 12;
  readonly stars = [1, 2, 3, 4, 5];
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  public apiUrl = 'http://localhost:3000';

  ngOnInit() {
    if (this.variant() === 'countdown') {
      this.timerInterval = setInterval(() => this.tick(), 1000);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  tick() {
    if (this.seconds > 0) {
      this.seconds--;
    } else if (this.minutes > 0) {
      this.minutes--;
      this.seconds = 59;
    } else if (this.hours > 0) {
      this.hours--;
      this.minutes = 59;
      this.seconds = 59;
    }
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  get countdownStr(): string {
    return `${this.pad(this.hours)}:${this.pad(this.minutes)}:${this.pad(this.seconds)}`;
  }

  mockOriginal(price: number): number {
    return Math.round(price * 1.6 * 100) / 100;
  }

  discountPct(product: Product): number {
    if (!product.discountPrice) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }
}

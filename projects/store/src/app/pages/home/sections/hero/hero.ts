import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, OnDestroy {
  slides = [
    {
      id: 0,
      badge:       'New Arrivals 2025',
      line1:       'Everything.',
      line2:       'Everywhere.',
      description: 'Experience the next evolution of multi-vendor shopping. Premium quality meets global convenience.',
      bgTint:      '#E8420A',
      image:       'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
      badgeLabel:  'Flash Deals',
      badgeValue:  'Up to 70% Off',
    },
    {
      id: 1,
      badge:       'Fresh Drops',
      line1:       'New',
      line2:       'Collection.',
      description: 'Explore the latest arrivals curated for modern living. Style meets function.',
      bgTint:      '#0EA5E9',
      image:       'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
      badgeLabel:  'New In',
      badgeValue:  '200+ Products',
    },
    {
      id: 2,
      badge:       'Best Sellers',
      line1:       'Top',
      line2:       'Picks.',
      description: "Lightning-fast deals on premium brands — shop before they're gone.",
      bgTint:      '#8B5CF6',
      image:       'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200',
      badgeLabel:  'Top Rated',
      badgeValue:  '4.8 ★ Average',
    },
  ];

  currentSlide = 0;
  isHovered = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void  { this.startAutoPlay(); }
  ngOnDestroy(): void { this.stopAutoPlay(); }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      if (!this.isHovered) this.nextSlide();
    }, 5000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  goToSlide(index: number): void { this.currentSlide = index; }
  nextSlide(): void { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  prevSlide(): void { this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length; }
}

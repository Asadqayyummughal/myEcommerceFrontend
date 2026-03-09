import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, MatIconModule, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, OnDestroy {
  slides = [
    {
      id: 0,
      badge: 'Summer Collection 2025',
      line1: 'BIG SUMMER',
      line2: 'SALE',
      accent: '#fbbf24',
      discountNum: '50',
      ringColor: 'rgba(251,191,36,0.25)',
      description: 'Discover our hottest deals on top-rated products. Limited time, unlimited savings.',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
      badgeBg: 'rgba(251,191,36,0.15)',
      badgeColor: '#fbbf24',
    },
    {
      id: 1,
      badge: 'Fresh Drops',
      line1: 'NEW',
      line2: 'COLLECTION',
      accent: '#34d399',
      discountNum: '40',
      ringColor: 'rgba(52,211,153,0.25)',
      description: 'Explore the latest arrivals curated for modern living. Style meets function.',
      bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      badgeBg: 'rgba(52,211,153,0.15)',
      badgeColor: '#34d399',
    },
    {
      id: 2,
      badge: 'Flash Deals',
      line1: 'TODAY\'S',
      line2: 'BEST DEALS',
      accent: '#a78bfa',
      discountNum: '30',
      ringColor: 'rgba(167,139,250,0.25)',
      description: 'Lightning-fast deals on premium brands. Shop before they\'re gone.',
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      badgeBg: 'rgba(167,139,250,0.15)',
      badgeColor: '#a78bfa',
    },
  ];

  currentSlide = 0;
  isHovered = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  private startAutoPlay() {
    this.intervalId = setInterval(() => {
      if (!this.isHovered) {
        this.nextSlide();
      }
    }, 5000);
  }

  private stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}

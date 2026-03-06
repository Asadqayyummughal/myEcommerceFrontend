import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, OnDestroy {
  slides = [
    { title: 'BIG SUMMER SALE', tag: '›', subtitle: 'UP TO', highlight: '50% OFF' },
    { title: 'NEW COLLECTION', tag: '›', subtitle: 'SAVE UP TO', highlight: '40% OFF' },
    { title: 'FLASH DEALS TODAY', tag: '›', subtitle: 'UP TO', highlight: '30% OFF' },
  ];

  currentSlide = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}

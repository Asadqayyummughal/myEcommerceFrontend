import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StripeService } from '@core/services/stripe-service';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule],
  templateUrl: './stripe-payment.html',
  styleUrl: './stripe-payment.scss',
})
export class StripePayment implements OnDestroy {
  @Input() clientSecret!: string;
  @Input() amount: number = 0;

  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  paying = false;
  errorMessage = '';

  constructor(private stripeService: StripeService) {}

  async ngAfterViewInit() {
    await this.stripeService.mountCard('card-element');
  }

  async pay() {
    this.paying = true;
    this.errorMessage = '';

    const result = await this.stripeService.confirmCardPayment(this.clientSecret);

    this.paying = false;

    if (result.success) {
      this.paymentSuccess.emit();
    } else {
      this.errorMessage = result.error ?? 'Payment failed. Please try again.';
      this.paymentError.emit(this.errorMessage);
    }
  }

  ngOnDestroy(): void {
    this.stripeService.destroy();
  }
}

import { Component, Input } from '@angular/core';
import { StripeService } from '@core/services/stripe-service';

@Component({
  selector: 'app-stripe-payment',
  imports: [],
  templateUrl: './stripe-payment.html',
  styleUrl: './stripe-payment.scss',
})
export class StripePayment {
  @Input() clientSecret!: string;

  constructor(private stripeService: StripeService) {}

  async ngAfterViewInit() {
    await this.stripeService.initStripe();
    this.stripeService.createCard('card-element');
  }

  async pay() {
    debugger;
    const result = await this.stripeService.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.stripeService.cardElement,
      },
    });

    if (result.error) {
      console.log(result.error.message);
    } else {
      console.log('Payment Success');
    }
  }
}

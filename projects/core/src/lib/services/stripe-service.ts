import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  stripePromise = loadStripe(environment.StripPublishKey);
  stripe!: Stripe;
  elements!: StripeElements;
  cardElement!: StripeCardElement;

  async initStripe() {
    this.stripe = (await loadStripe(environment.StripPublishKey)) as Stripe;
    this.elements = this.stripe.elements();
  }

  createCard(elementId: string) {
    this.cardElement = this.elements.create('card');
    this.cardElement.mount(`#${elementId}`);
  }
  async confirmPayment(clientSecret: string) {
    const stripe = await this.stripePromise;
    const result = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      },
    });
    debugger;
    console.log('check card Element bro====>', this.cardElement);

    return result;
  }
}

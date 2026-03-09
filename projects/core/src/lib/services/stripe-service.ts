import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private _stripe: Stripe | null = null;
  private _elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  /** Lazily initialises the Stripe.js instance (singleton). */
  async init(): Promise<Stripe> {
    if (!this._stripe) {
      this._stripe = (await loadStripe(environment.StripPublishKey)) as Stripe;
    }
    return this._stripe;
  }

  /**
   * Mounts the Stripe Card Element into the given DOM id.
   * Uses the Appearance API so styling is consistent with the app theme.
   */
  async mountCard(elementId: string): Promise<void> {
    const stripe = await this.init();

    if (!this._elements) {
      this._elements = stripe.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorDanger: '#dc2626',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
        },
      });
    }

    if (this.cardElement) {
      this.cardElement.unmount();
    }

    this.cardElement = this._elements.create('card', {
      style: {
        base: {
          fontSize: '15px',
          color: '#111827',
          fontSmoothing: 'antialiased',
          '::placeholder': { color: '#9ca3af' },
        },
        invalid: {
          color: '#dc2626',
          iconColor: '#dc2626',
        },
      },
    });

    this.cardElement.mount(`#${elementId}`);
  }

  /** Confirms a card payment with the given clientSecret. */
  async confirmCardPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    if (!this._stripe || !this.cardElement) {
      return { success: false, error: 'Payment not initialised. Please refresh and try again.' };
    }

    const result = await this._stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  }

  /** Unmounts the card and resets elements so they can be re-mounted next time. */
  destroy(): void {
    this.cardElement?.unmount();
    this.cardElement = null;
    this._elements = null;
  }
}

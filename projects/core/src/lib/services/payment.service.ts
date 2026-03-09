import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OrderService } from './order.service';

/**
 * Implement this interface for each payment gateway.
 * Steps to add a new gateway:
 *   1. Create a service implementing PaymentGateway
 *   2. Register it in PaymentService.gateways below
 *   3. Add the corresponding backend API call in OrderService
 */
export interface PaymentGateway {
  readonly id: string;
  /** Creates a payment intent / session and returns the client token */
  createIntent(orderId: string): Observable<string>;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
}

/**
 * Orchestrates all payment gateway selection and intent creation.
 * The checkout page should call this service — never a gateway service directly.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly gateways: Map<string, PaymentGateway>;

  constructor(private orderService: OrderService) {
    this.gateways = new Map<string, PaymentGateway>([
      [
        'stripe',
        {
          id: 'stripe',
          createIntent: (orderId: string) =>
            this.orderService
              .createPaymentIntent(orderId)
              .pipe(map((res: any) => res.data.clientSecret as string)),
        },
      ],
      // ── Add future gateways here ──────────────────────────────
      // ['paypal', paypalGatewayService],
      // ['razorpay', razorpayGatewayService],
      // ─────────────────────────────────────────────────────────
    ]);
  }

  /**
   * Creates a payment intent for the given method.
   * @returns Observable<clientSecret> used for client-side confirmation.
   */
  createIntent(method: string, orderId: string): Observable<string> {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new Error(`Payment gateway "${method}" is not registered.`);
    }
    return gateway.createIntent(orderId);
  }
}

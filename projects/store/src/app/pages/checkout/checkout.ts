import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { PaymentService } from '@core/services/payment.service';
import { FrontendCartItem } from '@models/cart.model';
import { StripePayment } from '../stripe-payment/stripe-payment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    StripePayment,
  ],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit, OnDestroy {
  items: FrontendCartItem[] = [];
  shippingForm!: FormGroup;
  paymentMethod: 'stripe' | 'cod' = 'cod';
  placing = false;
  orderPlaced = false;
  orderId = '';
  readonly apiUrl = 'http://localhost:3000';

  showStripePayment = false;
  clientSecret = '';
  stripeAmount = 0;

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    public authService: AuthService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe((items) => {
      this.items = items;
    });

    this.shippingForm = this.fb.group({
      fullName: [this.authService.currentUser?.name ?? '', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['Pakistan', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Totals ─────────────────────────────────────────
  get subtotal(): number {
    return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get shippingCost(): number {
    return this.subtotal >= 5000 ? 0 : 250;
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  // ── Place Order ────────────────────────────────────
  placeOrder(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    this.placing = true;

    this.orderService
      .createOrder({
        shippingAddress: this.shippingForm.value,
        paymentMethod: this.paymentMethod,
      })
      .subscribe({
        next: (res: any) => {
          const orderId = res.data?._id ?? res.orderId;
          this.orderId = orderId;

          if (this.paymentMethod === 'cod') {
            this.cartService.clearGuestCart();
            this.orderPlaced = true;
            this.placing = false;
          } else {
            this.initiateStripePayment(orderId);
          }
        },
        error: (err: any) => {
          this.snackBar.open(err?.error?.message ?? 'Could not place order. Try again.', 'Close', {
            duration: 4000,
          });
          this.placing = false;
        },
      });
  }

  // ── Stripe Flow ────────────────────────────────────
  private initiateStripePayment(orderId: string): void {
    this.paymentService.createIntent('stripe', orderId).subscribe({
      next: (clientSecret: string) => {
        this.clientSecret = clientSecret;
        this.stripeAmount = this.total;
        this.placing = false;
        this.showStripePayment = true;
      },
      error: (err: any) => {
        this.snackBar.open(
          err?.error?.message ?? 'Could not initiate payment. Try again.',
          'Close',
          { duration: 4000 },
        );
        this.placing = false;
      },
    });
  }

  onPaymentSuccess(): void {
    this.showStripePayment = false;
    this.cartService.clearGuestCart();
    this.orderPlaced = true;
  }

  onPaymentError(error: string): void {
    this.snackBar.open(error, 'Close', { duration: 6000 });
  }

  onPaymentCancel(): void {
    this.showStripePayment = false;
    this.snackBar.open(
      'Payment cancelled. Your order is saved — you can retry later.',
      'Dismiss',
      { duration: 5000 },
    );
  }

  // ── Helpers ────────────────────────────────────────
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}

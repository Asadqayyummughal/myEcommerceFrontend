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
import { environment } from 'projects/core/src/environments/environment';
import { FrontendCartItem } from '@models/cart.model';
import { StripeService } from '@core/services/stripe-service';
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

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    public authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private stripeService: StripeService,
  ) {}

  ngOnInit(): void {
    // Subscribe so auth cart loaded async is reflected
    this.sub = this.cartService.items$.subscribe((items) => {
      this.items = items;
      if (items.length === 0 && !this.orderPlaced) {
        // this.router.navigate(['/products']);
      }
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

  // ── Totals ────────────────────────────────────────
  get subtotal(): number {
    return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get shippingCost(): number {
    return this.subtotal >= 5000 ? 0 : 250;
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  // ── Place order ───────────────────────────────────
  placeOrder(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }
    this.placing = true;
    this.shippingForm.value;
    this.orderService
      .createOrder({
        shippingAddress: this.shippingForm.value,
        paymentMethod: this.paymentMethod,
      })
      .subscribe({
        next: (res: any) => {
          // Clear cart from memory for both guest and auth
          this.cartService.clearGuestCart();
          if (this.paymentMethod === 'cod') {
            //callFro CreatPaymnetIntent
            this.orderId = res.orderId;
            this.orderPlaced = true;
            this.placing = false;
          } else {
            this.createStripePaymentIntend(res.data._id);
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
  createStripePaymentIntend(orderId: 'string') {
    this.orderService.createPaymentIntent(orderId).subscribe({
      next: (resp) => {
        if (resp.success) {
          //on success get secret key and call the strip method
          this.confirmStripePaymentIntent(resp.data.clientSecret);
        }
      },
      error: (Error: any) => {},
    });
  }
  showStripePayment: boolean = false;
  clientSecret: string = '';
  async confirmStripePaymentIntent(clientSecret: string) {
    this.clientSecret = clientSecret;
    this.showStripePayment = true;
    // const result = await this.stripeService.confirmPayment(clientSecret);
    // if (result.error) {
    //   alert(result.error.message);
    // } else if (result.paymentIntent.status === 'succeeded') {
    //   this.orderPlaced = true;
    // }
  }
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'placeholderImage.jpg';
  }

  continueShopping(): void {
    // this.router.navigate(['/products']);
  }

  async ngAfterViewInit() {
    await this.stripeService.initStripe();

    this.stripeService.createCard('card-element');
  }
}

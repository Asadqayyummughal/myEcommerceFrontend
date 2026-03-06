import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: 'stripe' | 'cod';
  couponCode?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  createOrder(payload: CreateOrderPayload): Observable<any> {
    return this.api.post('order', payload);
  }

  getOrders(): Observable<any> {
    return this.api.get('order');
  }

  getOrderById(id: string): Observable<any> {
    return this.api.get(`order/${id}`);
  }

  createPaymentIntent(orderId: string): Observable<any> {
    return this.api.post('payment/stripe/create-intent', { orderId });
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private api: ApiService) {}

  // ── Vendor ────────────────────────────────────────────
  applyVendor(): Observable<any> {
    return this.api.post('vendor', {});
  }

  onboardStripe(): Observable<any> {
    return this.api.post('vendor/stripe/onboard', {});
  }

  getWallet(vendorId: string): Observable<any> {
    return this.api.get(`vendor/wallet/${vendorId}`);
  }

  // ── Payouts ───────────────────────────────────────────
  requestPayout(body: { amount: number; method: string; payoutDetails?: any }): Observable<any> {
    return this.api.post('vendor/payouts/request', body);
  }

  getPayouts(): Observable<any> {
    return this.api.get('vendor/payouts');
  }

  withdrawPayout(payoutId: string): Observable<any> {
    return this.api.post('vendor/payouts/withdraw', { payoutId });
  }

  // ── Store ─────────────────────────────────────────────
  createStore(body: any): Observable<any> {
    return this.api.post('vendor/store', body);
  }

  getMyStore(): Observable<any> {
    return this.api.get('vendor/store');
  }

  updateStore(storeId: string, body: any): Observable<any> {
    return this.api.put(`vendor/store/${storeId}`, body);
  }

  getStoreAnalytics(storeId: string): Observable<any> {
    return this.api.get(`vendor/store/${storeId}/analytics`);
  }

  getStoreProducts(storeId: string): Observable<any> {
    return this.api.get(`vendor/store/${storeId}/products`);
  }

  getStoreOrders(vendorId: string): Observable<any> {
    return this.api.get(`vendor/store/${vendorId}/orders`);
  }

  getVendorProfile(): Observable<any> {
    return this.api.get('vendor/profile');
  }

  // ── Products ──────────────────────────────────────────
  createProduct(formData: FormData): Observable<any> {
    return this.api.postFormData('vendor/product', formData);
  }

  getProduct(productId: string): Observable<any> {
    return this.api.get(`products/${productId}`);
  }

  updateProduct(productId: string, payload: any): Observable<any> {
    return this.api.put(`products/${productId}`, payload);
  }

  getOrderDetail(orderId: string): Observable<any> {
    return this.api.get(`order/${orderId}`);
  }

  getCategories(): Observable<any> {
    return this.api.get('product/categories');
  }

  getSubcategories(): Observable<any> {
    return this.api.get('product/subcategories');
  }
}

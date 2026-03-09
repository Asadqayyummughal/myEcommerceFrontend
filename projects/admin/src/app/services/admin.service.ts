import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  getDashboardStats(): Observable<any> {
    return this.api.get('admin/dashboard');
  }

  getUsers(params?: any): Observable<any> {
    return this.api.get('admin/users', params);
  }

  updateUser(id: string, payload: any): Observable<any> {
    return this.api.put(`admin/users/${id}`, payload);
  }

  getOrders(params?: any): Observable<any> {
    return this.api.get('order', params);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.api.put(`admin/orders/${id}/status`, { status });
  }

  getProducts(params?: any): Observable<any> {
    return this.api.get('products', params);
  }

  deleteProduct(id: string): Observable<any> {
    return this.api.delete(`products/${id}`);
  }

  toggleProductStatus(id: string, isActive: boolean): Observable<any> {
    return this.api.put(`products/${id}`, { isActive });
  }

  getCategories(): Observable<any> {
    return this.api.get('product/categories');
  }
}

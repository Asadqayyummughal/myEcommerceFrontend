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

  uploadImages(files: File[]): Observable<any> {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return this.api.postFormData('upload', fd);
  }

  createProduct(payload: any): Observable<any> {
    return this.api.post('products', payload);
  }

  updateProduct(id: string, payload: any): Observable<any> {
    return this.api.put(`products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<any> {
    return this.api.delete(`products/${id}`);
  }

  toggleProductStatus(id: string, isActive: boolean): Observable<any> {
    return this.api.put(`products/${id}`, { isActive });
  }

  getCategories(): Observable<any> { return this.api.get('product/categories'); }
  createCategory(payload: { name: string; description?: string }): Observable<any> { return this.api.post('product/categories', payload); }
  updateCategory(id: string, payload: any): Observable<any> { return this.api.put(`product/categories/categories/${id}`, payload); }
  deleteCategory(id: string): Observable<any> { return this.api.delete(`product/categories/categories/${id}`); }
  getSubcategories(): Observable<any> { return this.api.get('product/subcategories'); }
  createSubcategory(payload: { name: string; category: string }): Observable<any> { return this.api.post('product/subcategories', payload); }
  deleteSubcategory(id: string): Observable<any> { return this.api.delete(`product/subcategories/${id}`); }

  getCoupons(): Observable<any> { return this.api.get('admin/coupons'); }
  createCoupon(payload: any): Observable<any> { return this.api.post('admin/coupons', payload); }
  updateCoupon(id: string, payload: any): Observable<any> { return this.api.put(`admin/coupons/${id}`, payload); }
  deleteCoupon(id: string): Observable<any> { return this.api.delete(`admin/coupons/${id}`); }

  getRoles(): Observable<any> { return this.api.get('admin/roles'); }
  createRole(payload: { name: string; description?: string; permissions?: string[] }): Observable<any> { return this.api.post('admin/roles', payload); }
  updateRole(id: string, payload: any): Observable<any> { return this.api.put(`admin/roles/${id}`, payload); }
  deleteRole(id: string): Observable<any> { return this.api.delete(`admin/roles/${id}`); }
  assignRole(userId: string, roleId: string): Observable<any> { return this.api.put('admin/roles/assignRole', { userId, roleId }); }

  getPermissions(): Observable<any> { return this.api.get('admin/permissions'); }
  createPermission(payload: { name: string; description?: string }): Observable<any> { return this.api.post('admin/permissions', payload); }
  updatePermission(id: string, payload: any): Observable<any> { return this.api.put(`admin/permissions/${id}`, payload); }
  deletePermission(id: string): Observable<any> { return this.api.delete(`admin/permissions/${id}`); }

  banUser(id: string): Observable<any> { return this.api.put(`admin/users/${id}`, { isActive: false }); }
  activateUser(id: string): Observable<any> { return this.api.put(`admin/users/${id}`, { isActive: true }); }

  getVendors(status?: string): Observable<any> { return this.api.get('vendor/getVendorsByStatus', status ? { status } : {}); }
  approveVendor(vendorId: string): Observable<any> { return this.api.put(`vendor/${vendorId}/approve`, {}); }

  getStores(): Observable<any> { return this.api.get('vendor/store/listAllStores'); }
  updateStoreStatus(storeId: string, status: string): Observable<any> {
    return this.api.patch(`vendor/store/${storeId}/approve`, { status });
  }

  createShipment(payload: any): Observable<any> { return this.api.post('admin/shipments', payload); }
  markShipped(id: string): Observable<any> { return this.api.put(`admin/shipments/${id}/ship`, {}); }
  markDelivered(id: string): Observable<any> { return this.api.put(`admin/shipments/${id}/deliver`, {}); }
  sendGlobalNotification(payload: { title: string; message: string }): Observable<any> { return this.api.post('admin/notifications/sendGlobalNotifications', payload); }
}

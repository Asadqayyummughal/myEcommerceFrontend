import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '@models/product.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'products'; // temporary demo API
  constructor(private apiService: ApiService) {}
  getProducts(): Observable<Product[]> {
    return this.apiService.get(this.apiUrl).pipe(
      map((response: any) => {
        // Optional safety checks (recommended in production)
        if (!response.success) {
          return []; // or throw error if you prefer
        }
        return response.data.items as Product[];
      }),
    );
  }

  listProducts(params: {
    page?: number;
    limit?: number;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    categories?: string;
    sort?: string;
  }): Observable<{ success: boolean; data: { items: Product[]; meta: { total: number; page: number; limit: number; pages: number } } }> {
    return this.apiService.get(this.apiUrl, params);
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`${this.apiUrl}/${id}`);
  }
}

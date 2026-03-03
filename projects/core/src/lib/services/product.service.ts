import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '@models/product.model';
import { ApiService } from './api.service';

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://fakestoreapi.com/products'; // temporary demo API

  constructor(private apiService: ApiService) {}

  getProducts(): Observable<Product[]> {
    return this.apiService.get<FakeStoreProduct[]>(this.apiUrl).pipe(
      map((items) =>
        items.map((item) => ({
          _id: String(item.id),
          name: item.title,
          slug: item.title.toLowerCase().replace(/\s+/g, '-'),
          price: item.price,
          image: item.image,
          rating: item.rating.rate,
          reviewCount: item.rating.count,
          vendorName: item.category,
        })),
      ),
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<FakeStoreProduct>(`${this.apiUrl}/${id}`).pipe(
      map((item) => ({
        _id: String(item.id),
        name: item.title,
        slug: item.title.toLowerCase().replace(/\s+/g, '-'),
        price: item.price,
        image: item.image,
        rating: item.rating.rate,
        reviewCount: item.rating.count,
        vendorName: item.category,
      })),
    );
  }
}

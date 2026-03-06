import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductReview } from '@models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private api: ApiService) {}

  getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
  ): Observable<{ success: boolean; data: ProductReview[]; pagination: any }> {
    return this.api.get(`review/product/${productId}`, { page, limit });
  }
}

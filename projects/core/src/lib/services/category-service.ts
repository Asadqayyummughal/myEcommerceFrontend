import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Category } from '@models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private ApiService: ApiService) {}

  getCategories() {
    return this.ApiService.get<{ success: boolean; data: Category[] }>('product/categories');
  }
}

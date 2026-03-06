import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-16 text-center">
      <p class="text-gray-500 mb-4">Product detail page coming soon.</p>
      <a routerLink="/products" class="text-blue-500 hover:underline text-sm">← Back to Products</a>
    </div>
  `,
})
export class ProductDetail {}

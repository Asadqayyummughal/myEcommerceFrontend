import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@models/product.model';

@Component({
  selector: 'lib-product-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  standalone: true,
})
export class ProductCard {
  @Input() product!: Product;
  public apiUrl = 'http://localhost:3000';

  get discountPercentage(): number {
    if (!this.product.discountPrice) return 0;
    return Math.round(
      ((this.product.price - this.product.discountPrice) / this.product.price) * 100,
    );
  }
}

import { Component } from '@angular/core';
import { ProductService } from '@core/services/product.service';
import { Product } from '@models/product.model';
import { ProductCard } from '@ui/components/product-card/product-card';
@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  products: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

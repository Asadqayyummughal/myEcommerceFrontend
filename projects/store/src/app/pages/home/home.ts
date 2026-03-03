import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '@core/services/product.service';
import { ProductCard } from '@ui/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  products = toSignal(inject(ProductService).getProducts(), { initialValue: [] });
}

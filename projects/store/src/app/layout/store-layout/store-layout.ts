import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { CartDrawer } from '@ui/components/cart-drawer/cart-drawer';

@Component({
  selector: 'app-store-layout',
  imports: [Header, Footer, RouterOutlet, CartDrawer],
  templateUrl: './store-layout.html',
  styleUrl: './store-layout.scss',
})
export class StoreLayout {}

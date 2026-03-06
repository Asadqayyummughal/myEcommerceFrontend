import { Component, OnDestroy, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CartDrawer } from '@ui/components/cart-drawer/cart-drawer';
import { CartService } from '@core/services/cart.service';

@Component({
  selector: 'app-store-layout',
  imports: [Header, Footer, RouterOutlet, MatDialogModule],
  templateUrl: './store-layout.html',
  styleUrl: './store-layout.scss',
})
export class StoreLayout implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<CartDrawer> | null = null;
  private sub!: Subscription;

  constructor(
    private cartService: CartService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.drawerOpen$.subscribe((open) => {
      if (open && !this.dialogRef) {
        this.dialogRef = this.dialog.open(CartDrawer, {
          position: { top: '0', right: '0' },
          height: '100vh',
          maxHeight: '100vh',
          width: '420px',
          maxWidth: '92vw',
          panelClass: 'cart-dialog-panel',
          autoFocus: false,
          restoreFocus: false,
        });
        this.dialogRef.afterClosed().subscribe(() => {
          this.dialogRef = null;
          // Sync service state without triggering another close attempt
          if (this.cartService.drawerSubject.value) {
            this.cartService.closeDrawer();
          }
        });
      } else if (!open && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

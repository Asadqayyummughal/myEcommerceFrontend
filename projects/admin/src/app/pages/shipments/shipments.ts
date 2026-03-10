import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './shipments.html',
})
export class Shipments implements OnInit {
  orders: any[] = [];
  loading = true;
  showModal = false;
  selectedOrder: any = null;
  form = { carrier: '', trackingNumber: '' };
  saving = false;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getOrders({ status: 'processing', limit: 50 }).subscribe({
      next: (res: any) => {
        const d = res.data ?? res;
        this.orders = d.items ?? d.orders ?? d ?? [];
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.loading = false;
      },
    });
  }

  openShipModal(order: any): void {
    this.selectedOrder = order;
    this.form = { carrier: '', trackingNumber: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createShipment(): void {
    if (!this.form.carrier || !this.form.trackingNumber) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 2000 });
      return;
    }
    this.saving = true;
    this.adminService.createShipment({
      orderId: this.selectedOrder._id,
      ...this.form,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.snackBar.open('Shipment created successfully', '✓', { duration: 2500 });
        this.loadOrders();
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to create shipment', 'Close', { duration: 2500 });
      },
    });
  }

  markShipped(shipmentId: string): void {
    this.adminService.markShipped(shipmentId).subscribe({
      next: () => this.snackBar.open('Marked as shipped', '✓', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to mark as shipped', 'Close', { duration: 2000 }),
    });
  }

  markDelivered(shipmentId: string): void {
    this.adminService.markDelivered(shipmentId).subscribe({
      next: () => this.snackBar.open('Marked as delivered', '✓', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to mark as delivered', 'Close', { duration: 2000 }),
    });
  }
}

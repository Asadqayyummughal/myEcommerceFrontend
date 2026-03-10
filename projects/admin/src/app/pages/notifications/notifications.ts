import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './notifications.html',
})
export class Notifications {
  form = { title: '', message: '' };
  sending = false;
  sent = false;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  send(): void {
    if (!this.form.title.trim() || !this.form.message.trim()) {
      this.snackBar.open('Please fill in both title and message', 'Close', { duration: 2500 });
      return;
    }
    this.sending = true;
    this.adminService.sendGlobalNotification({ title: this.form.title, message: this.form.message }).subscribe({
      next: () => {
        this.sending = false;
        this.sent = true;
        this.snackBar.open('Notification broadcast successfully', '✓', { duration: 2500 });
        setTimeout(() => {
          this.sent = false;
          this.form = { title: '', message: '' };
        }, 3000);
      },
      error: () => {
        this.sending = false;
        this.snackBar.open('Failed to send notification', 'Close', { duration: 2500 });
      },
    });
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.html',
})
export class Signup {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirm  = true;

  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        name:            ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
        confirmPassword: ['', Validators.required],
        phone:           [''],
        image:           [''],
      },
      { validators: passwordMatchValidator },
    );
  }

  get name()            { return this.form.get('name')!; }
  get email()           { return this.form.get('email')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }
  get phone()           { return this.form.get('phone')!; }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.form.patchValue({ image: '' });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';

    this.authService.signup(this.name.value, this.email.value, this.password.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 from the API means the server rejected the token — force logout
      if (err.status === 401 && authService.isLoggedIn) {
        authService.clearSession();
        router.navigate(['/auth/login'], {
          queryParams: { reason: 'session_expired' },
        });
      }
      return throwError(() => err);
    }),
  );
};

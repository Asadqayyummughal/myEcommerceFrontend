import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const vendorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }

  if (auth.currentUser?.role?.name !== 'vendor') {
    return router.createUrlTree(['/apply']);
  }

  return true;
};

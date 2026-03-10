import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roleRaw = auth.currentUser?.role;
  const role = typeof roleRaw === 'object' ? (roleRaw as any)?.name : roleRaw;
  //&& (role === 'admin' || role === 'support')
  if (auth.isLoggedIn) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

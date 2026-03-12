import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { VendorService } from '../services/vendor.service';
import { map, catchError, of } from 'rxjs';

export const vendorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const vendorService = inject(VendorService);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }

  if (auth.currentUser?.role?.name !== 'vendor') {
    return router.createUrlTree(['/apply']);
  }

  return vendorService.getVendorProfile().pipe(
    map((res: any) => {
      const status = (res.data?.status ?? res.status ?? '').toLowerCase();
      if (status === 'pending')   return router.createUrlTree(['/pending']);
      if (status === 'suspended') return router.createUrlTree(['/suspended']);
      if (status === 'rejected')  return router.createUrlTree(['/rejected']);
      return true;
    }),
    catchError(() => of(true)),
  );
};

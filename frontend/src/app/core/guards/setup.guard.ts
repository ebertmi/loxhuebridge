import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

export const setupGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.checkSetupStatus().pipe(
    map(status => {
      if (status.configured) {
        return true;
      }
      return router.createUrlTree(['/setup']);
    }),
    catchError(() => of(router.createUrlTree(['/setup'])))
  );
};

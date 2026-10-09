import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthPocketbaseService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthPocketbaseService);
  const isLogged = auth.isLoggedIn && auth.user?.['type'] === 'admin';

  if (isLogged) {
    return true;
  }

  router.navigate(['/dashboard/login']);
  return false;
};

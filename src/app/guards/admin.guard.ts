import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const isLogged = localStorage.getItem('cw_admin_session') === 'active';

  if (isLogged) {
    return true;
  }

  router.navigate(['/dashboard/login']);
  return false;
};
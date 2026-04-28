import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()?.roles.includes('ROLE_SUPER_ADMIN')) return true;

  router.navigate(['/forbidden']);
  return false;
};
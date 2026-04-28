import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const moderatorGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const roles = auth.currentUser()?.roles ?? [];
  const allowed = ['ROLE_MODERATOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];

  if (roles.some(r => allowed.includes(r))) return true;

  router.navigate(['/forbidden']);
  return false;
};
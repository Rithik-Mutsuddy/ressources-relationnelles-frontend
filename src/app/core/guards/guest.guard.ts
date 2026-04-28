import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// Redirige un utilisateur déjà connecté hors des pages login/register
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;

  router.navigate(['/citizen/dashboard']);
  return false;
};
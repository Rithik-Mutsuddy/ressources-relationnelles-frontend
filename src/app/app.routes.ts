import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { moderatorGuard } from './core/guards/moderator.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';


export const routes: Routes = [
  // Redirection racine
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // ── PUBLIC (citoyen non connecté) ──────────────────────────
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
  },

  // ── AUTH (login, register, callback FC) ─────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],   // Bloque si déjà connecté (sauf callback)
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ── CITOYEN CONNECTÉ ────────────────────────────────────────
  {
    path: 'citizen',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/citizen/citizen.routes').then(m => m.CITIZEN_ROUTES)
  },

  // ── MODÉRATEUR ──────────────────────────────────────────────
  {
    path: 'moderator',
    canActivate: [moderatorGuard],
    loadChildren: () =>
      import('./features/moderator/moderator.routes').then(m => m.MODERATOR_ROUTES)
  },

  // ── ADMINISTRATEUR ──────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // ── SUPER ADMIN ─────────────────────────────────────────────
  {
    path: 'superadmin',
    canActivate: [superAdminGuard],
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES)
  },

  // ── Utilitaires ─────────────────────────────────────────────
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent)
  },
  { path: '**', redirectTo: '/home' }
];
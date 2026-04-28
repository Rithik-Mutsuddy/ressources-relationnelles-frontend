import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    // Route callback FranceConnect — PAS de guestGuard ici
    path: 'france-connect/callback',
    loadComponent: () =>
      import('./france-connect-callback/france-connect-callback.component')
        .then(m => m.FranceConnectCallbackComponent)
  }
];
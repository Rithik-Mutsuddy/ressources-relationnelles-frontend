import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
 /* {
    path: 'accounts',
    loadComponent: () =>
      import('./accounts/account-list/account-list.component')
        .then(m => m.AccountListComponent)
  },
  {
    path: 'accounts/create',
    loadComponent: () =>
      import('./accounts/account-create/account-create.component')
        .then(m => m.AccountCreateComponent)
  }*/
];
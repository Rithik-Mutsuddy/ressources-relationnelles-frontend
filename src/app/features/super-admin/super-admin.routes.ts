import { Routes } from '@angular/router';
import { SuperAdminLayoutComponent } from './super-admin-layout/super-admin-layout.component';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: SuperAdminLayoutComponent,
    children: [
      {
        path: 'resources',
        loadComponent: () =>
          import('./resources/super-admin-resources.component')
            .then(m => m.SuperAdminResourcesComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/super-admin-categories.component')
            .then(m => m.SuperAdminCategoriesComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/super-admin-users.component')
            .then(m => m.SuperAdminUsersComponent)
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./statistics/super-admin-statistics.component')
            .then(m => m.SuperAdminStatisticsComponent)
      },
      {
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
      }
    ]
  }
];
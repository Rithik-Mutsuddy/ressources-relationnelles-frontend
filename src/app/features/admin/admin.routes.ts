import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'resources',
        loadComponent: () =>
          import('./resources/admin-resources.component')
            .then(m => m.AdminResourcesComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/admin-categories.component')
            .then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/admin-users.component')
            .then(m => m.AdminUsersComponent)
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./statistics/admin-statistics.component')
            .then(m => m.AdminStatisticsComponent)
      },
    ]
  }
];
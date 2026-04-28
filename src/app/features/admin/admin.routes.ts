import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
 /* {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },
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
      import('./users/admin-users.component').then(m => m.AdminUsersComponent)
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./statistics/admin-statistics.component')
        .then(m => m.AdminStatisticsComponent)
  }*/
];
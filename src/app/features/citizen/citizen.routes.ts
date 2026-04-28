import { Routes } from '@angular/router';

export const CITIZEN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
 /* {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'my-resources',
    loadComponent: () =>
      import('./my-resources/my-resources.component').then(m => m.MyResourcesComponent)
  },
  {
    path: 'resources/create',
    loadComponent: () =>
      import('./resource-create/resource-create.component')
        .then(m => m.ResourceCreateComponent)
  },
  {
    path: 'resources/:id/edit',
    loadComponent: () =>
      import('./resource-edit/resource-edit.component')
        .then(m => m.ResourceEditComponent)
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./progress/progress.component').then(m => m.ProgressComponent)
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./activities/activity-list/activity-list.component')
        .then(m => m.ActivityListComponent)
  },
  {
    path: 'activities/:id',
    loadComponent: () =>
      import('./activities/activity-detail/activity-detail.component')
        .then(m => m.ActivityDetailComponent)
  }*/
];
import { Routes } from '@angular/router';
import { CitizenLayoutComponent } from './citizen-layout/citizen-layout.component';

export const CITIZEN_ROUTES: Routes = [
  {
    path: '',
    component: CitizenLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
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
        path: 'favorites',
        loadComponent: () =>
          import('./favorites/favorites.component').then(m => m.FavoritesComponent)
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then(m => m.ProfileComponent)
      },
      /*{
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
      },*/
      /* {
   path: 'progress',
   loadComponent: () =>
     import('./progress/progress.component').then(m => m.ProgressComponent)
 },*/
    ]
  }
];
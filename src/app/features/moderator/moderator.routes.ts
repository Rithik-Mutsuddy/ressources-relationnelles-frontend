import { Routes } from '@angular/router';
import { ModeratorLayoutComponent } from './moderator-layout/moderator-layout.component';

export const MODERATOR_ROUTES: Routes = [
  {
    path: '',
    component: ModeratorLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
       {
         path: 'pending',
         loadComponent: () =>
           import('./pending-resources/pending-resources.component')
             .then(m => m.PendingResourcesComponent)
       },
       {
         path: 'comments',
         loadComponent: () =>
           import('./reported-comments/reported-comments.component')
             .then(m => m.ReportedCommentsComponent)
       }
    ]
  }
];
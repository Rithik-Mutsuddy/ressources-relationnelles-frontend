import { Routes } from '@angular/router';

export const MODERATOR_ROUTES: Routes = [
  { path: '', redirectTo: 'pending', pathMatch: 'full' },
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
];
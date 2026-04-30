import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ResourceService } from '../../../core/services/resource.service';
import { InteractionService } from '../../../core/services/interaction.service';
import { Resource } from '../../../core/models/resource.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private resSvc = inject(ResourceService);
  private interactionSvc = inject(InteractionService);
  user = this.auth.currentUser;

  // Statistiques des cartes
  stats = signal({
    views: 42,
    favorites: 0,
    myResources: 3,
    progression: 68,
  });

  // Activité récente (ressources consultées)
  recentActivity = signal<Resource[]>([]);


  // À lire plus tard (ressources "aside")
  readLater = signal<Resource[]>([]);

  asides = signal<any[]>([]);

  ngOnInit() {
    this.resSvc.getAll().subscribe(r => {
      this.recentActivity.set(r.slice(0, 3));
    });

    this.interactionSvc.getAsides().subscribe(data => {
      this.asides.set(data);

      // 👉 transformation vers Resource[]
      this.readLater.set(
        data.map(i => i.resource)
      );
    });
  }

  getFirstName(): string {
    return this.user()?.firstname ?? '';
  }
}
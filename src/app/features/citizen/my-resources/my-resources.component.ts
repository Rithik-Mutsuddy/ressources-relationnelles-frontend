import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ResourceService } from '../../../core/services/resource.service';
import { Resource, ResourceStatus } from '../../../core/models/resource.model';
import { InteractionService } from '../../../core/services/interaction.service';

type TabKey = 'all' | 'published' | 'pending' | 'draft';

@Component({
  selector: 'app-my-resources',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './my-resources.component.html',
  styleUrl: './my-resources.component.scss'
})
export class MyResourcesComponent implements OnInit {
  private resSvc = inject(ResourceService);
  private intSvc = inject(InteractionService);

  activeTab = signal<TabKey>('all');
  allResources = signal<Resource[]>([]);
  pendingResources = signal<Resource[]>([]);
  draftResources = signal<Resource[]>([]);

  ngOnInit() {
    this.resSvc.getAll().subscribe(r => this.allResources.set(r));
    this.intSvc.getPending().subscribe(r =>
      this.pendingResources.set(r)
    );
    this.intSvc.getDraft().subscribe(r =>
      this.draftResources.set(r)
    );
  }


  get published() { return this.allResources().filter(r => r.status === 'published'); }
  get pending() {
    return this.pendingResources().length
      ? this.pendingResources()
      : this.allResources().filter(r => r.status === 'pending');
  }
  get draft() {
    return this.draftResources().length
      ? this.draftResources()
      : this.allResources().filter(r => r.status === 'draft' as any);
  }

  get displayed(): Resource[] {
    switch (this.activeTab()) {
      case 'published': return this.published;
      case 'pending': return this.pending;
      case 'draft': return this.draft;
      default: return this.allResources();
    }
  }

  tabs(): { key: TabKey; label: string; count: number }[] {
    return [
      { key: 'all', label: 'Toutes', count: this.allResources().length },
      { key: 'published', label: 'Publiées', count: this.published.length },
      { key: 'pending', label: 'En attente', count: this.pending.length },
      { key: 'draft', label: 'Brouillons', count: this.draft.length },
    ];
  }

  getTypeBadgeClass(type: string) {
    const m: Record<string, string> = {
      video: 'badge--purple', article: 'badge--blue',
      guide: 'badge--green', activity: 'badge--orange'
    };
    return m[type] ?? 'badge--blue';
  }

  getTypeLabel(type: string) {
    const m: Record<string, string> = {
      video: 'Video', article: 'Article', guide: 'Document', activity: 'Podcast'
    };
    return m[type] ?? type;
  }

  getStatusBadgeClass(status: string) {
    const m: Record<string, string> = {
      published: 'status--published',
      pending: 'status--pending',
      rejected: 'status--rejected',
      draft: 'status--draft',
    };
    return m[status] ?? '';
  }

  getStatusLabel(status: string) {
    const m: Record<string, string> = {
      published: 'Publié', pending: 'En attente',
      rejected: 'Rejeté', draft: 'Brouillon',
    };
    return m[status] ?? status;
  }
}
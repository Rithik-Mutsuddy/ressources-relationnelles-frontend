import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModeratorService } from '../../../core/services/moderator.service';
import { Resource } from '../../../core/models/resource.model';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { InteractionService } from '../../../core/services/interaction.service';
import { ResourceService } from '../../../core/services/resource.service';

type StatusFilter = 'all' | 'published' | 'pending' | 'draft';

@Component({
  selector: 'app-pending-resources',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './pending-resources.component.html',
  styleUrl: './pending-resources.component.scss'
})
export class PendingResourcesComponent implements OnInit {

  private modSvc = inject(ResourceService);
  private intSvc = inject(InteractionService);

  resources    = signal<Resource[]>([]);
  searchQuery  = '';
  statusFilter = signal<StatusFilter>('all');
  dropdownOpen = signal(false);
  loading      = signal(true);

  toast = signal<{ msg: string; type: 'validate' | 'reject' } | null>(null);

  readonly STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all',       label: 'Tous les statuts' },
    { value: 'published', label: 'Publié' },
    { value: 'pending',   label: 'En attente' },
    { value: 'draft',     label: 'Brouillon' },
  ];

  ngOnInit() {
    // ✅ CORRECT : on utilise getPendingAll()
    this.intSvc.getPendingAll().subscribe({
      next: (r: Resource[]) => {
        this.resources.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /* ───────────────────────────────
   * FILTRAGE
   * ─────────────────────────────── */
  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const status = this.statusFilter();

    return this.resources().filter(r => {
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.author?.firstname?.toLowerCase().includes(q) ||
        r.author?.lastname?.toLowerCase().includes(q);

      const matchStatus =
        status === 'all' || r.status === status;

      return matchSearch && matchStatus;
    });
  });

  get currentStatusLabel(): string {
    return this.STATUS_OPTIONS.find(o => o.value === this.statusFilter())?.label
      ?? 'Tous les statuts';
  }

  /* ───────────────────────────────
   * ACTIONS MODÉRATION
   * ─────────────────────────────── */
  validate(resource: Resource, event: Event) {
    event.stopPropagation();

    this.modSvc.validateResource(resource.id).subscribe(() => {
      this.resources.update(list =>
        list.map(r =>
          r.id === resource.id ? { ...r, status: 'published' } : r
        )
      );

      this.showToast('Ressource publiée avec succès', 'validate');
    });
  }

  reject(resource: Resource, event: Event) {
    event.stopPropagation();

    this.modSvc.rejectResource(resource.id).subscribe(() => {
      this.resources.update(list =>
        list.map(r =>
          r.id === resource.id ? { ...r, status: 'rejected' } : r
        )
      );

      this.showToast('Ressource rejetée', 'reject');
    });
  }

  /* ───────────────────────────────
   * DROPDOWN
   * ─────────────────────────────── */
  selectStatus(value: StatusFilter) {
    this.statusFilter.set(value);
    this.dropdownOpen.set(false);
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  /* ───────────────────────────────
   * HELPERS UI
   * ─────────────────────────────── */
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      published: 'badge-status--green',
      pending:   'badge-status--yellow',
      rejected:  'badge-status--red',
      draft:     'badge-status--gray',
    };
    return map[status] ?? 'badge-status--gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      published: 'Publié',
      pending:   'En attente',
      rejected:  'Rejeté',
      draft:     'Brouillon',
    };
    return map[status] ?? status;
  }

  /* ───────────────────────────────
   * TOAST
   * ─────────────────────────────── */
  private showToast(msg: string, type: 'validate' | 'reject') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
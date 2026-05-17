import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { PlatformStatistics } from '../../../core/models/statistics.model';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-statistics.component.html',
  styleUrl: './admin-statistics.component.scss'
})
export class AdminStatisticsComponent implements OnInit {
  private adminSvc = inject(AdminService);

  stats     = signal<PlatformStatistics | null>(null);
  loading   = signal(true);
  exporting = signal(false);
  toast     = signal<string | null>(null);
  today     = new Date();

  ngOnInit() {
    this.adminSvc.getStatistics().subscribe({
      next: (s: any) => { this.stats.set(s); this.loading.set(false); },
      error: ()      => this.loading.set(false)
    });
  }

  // ── Export CSV ───────────────────────────────────────────
  exportCSV() {
    const s = this.stats();
    if (!s) return;
    this.exporting.set(true);

    const rows = [
      ['Métrique', 'Valeur', 'Description'],
      ['Total ressources',          s.total_resources, 'Toutes ressources confondues'],
      ['Ressources publiées',       s.published,       'En ligne et visibles par tous'],
      ['Ressources en attente',     s.pending,         'En cours de modération'],
      ['Ressources non publiées',   s.total_resources - s.published - s.pending, 'Rejetées ou brouillons'],
      ['Utilisateurs inscrits',     s.total_users,     'Comptes citoyens actifs'],
      ['Date export',               this.today.toLocaleDateString('fr-FR'), ''],
    ];

    const csv  = rows.map(r => r.map(v => `"${v}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `statistiques_plateforme_${this.today.toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.exporting.set(false);
    this.showToast('Fichier CSV téléchargé avec succès');
  }

  // ── Helpers ──────────────────────────────────────────────
  getPublishedPercent(): number {
    const s = this.stats();
    if (!s || s.total_resources === 0) return 0;
    return Math.round((s.published / s.total_resources) * 100);
  }

  getPendingPercent(): number {
    const s = this.stats();
    if (!s || s.total_resources === 0) return 0;
    return Math.round((s.pending / s.total_resources) * 100);
  }

  getOtherPercent(): number {
    return Math.max(0, 100 - this.getPublishedPercent() - this.getPendingPercent());
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
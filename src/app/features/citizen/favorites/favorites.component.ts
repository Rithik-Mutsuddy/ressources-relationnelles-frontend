import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InteractionService } from '../../../core/services/interaction.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  private svc = inject(InteractionService);
  favorites = signal<any[]>([]);

  ngOnInit() {
    this.svc.getFavorites().subscribe(res => {
      this.favorites.set(res);
    });
  }

  getTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    video: 'badge--purple',
    article: 'badge--blue',
    guide: 'badge--green',
    podcast: 'badge--orange',
    document: 'badge--green',
  };
  return map[type] ?? 'badge--blue';
}

getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    video: 'Video',
    article: 'Article',
    guide: 'Guide',
    podcast: 'Podcast',
    document: 'Document',
  };
  return map[type] ?? type;
}
}
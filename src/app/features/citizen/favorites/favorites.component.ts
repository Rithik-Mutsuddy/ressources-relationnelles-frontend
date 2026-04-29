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
    // En production : récupérer les interactions de type "favorite" de l'user
    this.favorites.set([]);
  }
} 
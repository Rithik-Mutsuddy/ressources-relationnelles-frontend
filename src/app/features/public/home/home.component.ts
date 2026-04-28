import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResourceService } from '../../../core/services/resource.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Resource } from '../../../core/models/resource.model';
import { Category } from '../../../core/models/category.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private resourceSvc  = inject(ResourceService);
  private categorySvc  = inject(CategoryService);
  private router       = inject(Router);
  auth                 = inject(AuthService);

  searchQuery  = '';
  popularResources = signal<Resource[]>([]);
  categories       = signal<Category[]>([]);

  // Statistiques affichées (image 7)
  stats = { resources: 6, users: 500, categories: 8 };

  // Icônes par catégorie
  categoryIcons: Record<string, string> = {
    'Démocratie':    'book',
    'Méthodologie':  'users',
    'Finances':      'trending-up',
    'Inspiration':   'book',
    'Technologie':   'users',
    'Environnement': 'trending-up',
    'Éducation':     'book',
    'Culture':       'users',
  };

  ngOnInit() {
    this.resourceSvc.getAll().subscribe(r => this.popularResources.set(r.slice(0, 3)));
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/resources'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      video:    'badge--purple',
      article:  'badge--blue',
      guide:    'badge--green',
      podcast:  'badge--orange',
      document: 'badge--green',
    };
    return map[type] ?? 'badge--blue';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      video:    '▶',
      article:  '📄',
      guide:    '📄',
      podcast:  '🎙',
      document: '📄',
    };
    return map[type] ?? '📄';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      video: 'Video', article: 'Article',
      guide: 'Guide', podcast: 'Podcast', document: 'Document',
    };
    return map[type] ?? type;
  }
}
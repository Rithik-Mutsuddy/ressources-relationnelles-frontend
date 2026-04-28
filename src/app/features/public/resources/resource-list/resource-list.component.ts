import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../../../core/services/resource.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Resource, ResourceType } from '../../../../core/models/resource.model';
import { Category } from '../../../../core/models/category.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './resource-list.component.html',
  styleUrl: './resource-list.component.scss'
})
export class ResourceListComponent implements OnInit {
  private resourceSvc = inject(ResourceService);
  private categorySvc = inject(CategoryService);
  private route       = inject(ActivatedRoute);

  resources    = signal<Resource[]>([]);
  categories   = signal<Category[]>([]);
  searchQuery  = '';
  selectedTypes: ResourceType[] = [];
  selectedCats: number[] = [];

  readonly TYPES: { value: ResourceType; label: string }[] = [
    { value: 'article',  label: 'Article' },
    { value: 'video',    label: 'Vidéo' },
    { value: 'guide',    label: 'Document' },
    { value: 'activity', label: 'Podcast' },
  ];

  ngOnInit() {
    // Pré-remplir le filtre depuis query params (venant de la homepage)
    this.route.queryParams.subscribe(p => {
      if (p['search']) this.searchQuery = p['search'];
      if (p['categoryId']) this.selectedCats = [+p['categoryId']];
      this.loadResources();
    });
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
  }

  loadResources() {
    this.resourceSvc.getAll({
      search: this.searchQuery || undefined,
      type: this.selectedTypes[0],
    }).subscribe(r => this.resources.set(r));
  }

  get filteredResources(): Resource[] {
    return this.resources().filter(r => {
      const matchSearch = !this.searchQuery ||
        r.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchType = this.selectedTypes.length === 0 ||
        this.selectedTypes.includes(r.type as ResourceType);
      const matchCat = this.selectedCats.length === 0 ||
        (r.category && this.selectedCats.includes(r.category.id));
      return matchSearch && matchType && matchCat;
    });
  }

  toggleType(type: ResourceType) {
    const idx = this.selectedTypes.indexOf(type);
    if (idx >= 0) this.selectedTypes.splice(idx, 1);
    else this.selectedTypes.push(type);
  }

  toggleCat(id: number) {
    const idx = this.selectedCats.indexOf(id);
    if (idx >= 0) this.selectedCats.splice(idx, 1);
    else this.selectedCats.push(id);
  }

  isTypeSelected(type: ResourceType)  { return this.selectedTypes.includes(type); }
  isCatSelected(id: number)           { return this.selectedCats.includes(id); }

  getBadgeClass(type: string) {
    const map: Record<string, string> = {
      video: 'badge--purple', article: 'badge--blue',
      guide: 'badge--green',  activity: 'badge--orange'
    };
    return map[type] ?? 'badge--blue';
  }

  getTypeLabel(type: string) {
    const map: Record<string, string> = {
      video: 'Video', article: 'Article', guide: 'Document', activity: 'Podcast'
    };
    return map[type] ?? type;
  }
}
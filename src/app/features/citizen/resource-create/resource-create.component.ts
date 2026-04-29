import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResourceService } from '../../../core/services/resource.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

type AlertType = 'draft' | 'submitted' | null;

@Component({
  selector: 'app-resource-create',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './resource-create.component.html',
  styleUrl: './resource-create.component.scss'
})
export class ResourceCreateComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private resSvc      = inject(ResourceService);
  private categorySvc = inject(CategoryService);
  private router      = inject(Router);

  categories    = signal<Category[]>([]);
  loading       = signal(false);
  alert         = signal<AlertType>(null); // null | 'draft' | 'submitted'

  readonly TYPES = [
    { value: 'article',  label: 'Article' },
    { value: 'video',    label: 'Vidéo' },
    { value: 'guide',    label: 'Document' },
    { value: 'activity', label: 'Podcast' },
  ];

  readonly GUIDE_TIPS = [
    'Utilisez un titre clair et descriptif',
    'Rédigez une description concise',
    'Structurez votre contenu avec des paragraphes',
    'Ajoutez des tags pertinents',
    'Relisez avant de soumettre',
  ];

  readonly VALIDATION_STEPS = [
    'Soumission de la ressource',
    'Vérification par l\'équipe',
    'Publication ou demande de modification',
  ];

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(5)]],
    description: ['', Validators.required],
    type:        ['', Validators.required],
    category_id: ['', Validators.required],
    tags:        [''],
    content:     ['', Validators.required],
    visibility:  ['public'],
  });

  ngOnInit() {
    this.categorySvc.getAll().subscribe(c => this.categories.set(c));
  }

  // Soumettre pour validation (status = pending)
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    const data = {
      ...this.form.value,
      status: 'pending',
    };

    this.resSvc.create(data as any).subscribe({
      next: () => {
        this.showAlert('submitted');
        setTimeout(() => this.router.navigate(['/citizen/my-resources']), 2000);
      },
      error: () => this.loading.set(false),
    });
  }

  // Sauvegarder en brouillon (status = draft)
  saveDraft() {
    if (!this.form.value.title) return;
    this.loading.set(true);

    const data = {
      ...this.form.value,
      status: 'draft',
    };

    this.resSvc.create(data as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.showAlert('draft');
      },
      error: () => this.loading.set(false),
    });
  }

  private showAlert(type: AlertType) {
    this.loading.set(false);
    this.alert.set(type);
    setTimeout(() => this.alert.set(null), 3500);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }
}
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  private catSvc = inject(CategoryService);
  private fb     = inject(FormBuilder);

  categories  = signal<Category[]>([]);
  loading     = signal(true);
  searchQuery = '';
  showModal   = signal(false);
  editTarget  = signal<Category | null>(null);
  toast       = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.categories().filter(c =>
      !q || c.name.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.catSvc.adminGetAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.editTarget.set(null);
    this.form.reset({ name: '', description: '' });
    this.showModal.set(true);
  }

  openEdit(cat: Category) {
    this.editTarget.set(cat);
    this.form.patchValue({ name: cat.name, description: cat.description ?? '' });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = {
      name:        this.form.value.name!.trim(),
      description: this.form.value.description?.trim() ?? ''
    };
    const target = this.editTarget();

    if (target) {
      this.catSvc.update(target.id, data).subscribe(updated => {
        this.categories.update(list => list.map(c => c.id === target.id ? updated : c));
        this.closeModal();
        this.showToast('Catégorie mise à jour', 'success');
      });
    } else {
      this.catSvc.create(data).subscribe(created => {
        this.categories.update(list => [...list, created]);
        this.closeModal();
        this.showToast('Catégorie créée avec succès', 'success');
      });
    }
  }

  delete(cat: Category) {
    if (!confirm(`Supprimer la catégorie "${cat.name}" ?\nLes ressources liées ne seront pas supprimées.`)) return;
    this.catSvc.delete(cat.id).subscribe(() => {
      this.categories.update(list => list.filter(c => c.id !== cat.id));
      this.showToast('Catégorie supprimée', 'success');
    });
  }

  get isEditing(): boolean { return !!this.editTarget(); }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
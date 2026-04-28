import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { Category } from '../models/category.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly API       = `${environment.apiUrl}/resources`;
  private readonly ADMIN_API = `${environment.apiUrl}/admin/categories`;

  // State local — catégories en cache (utiles pour les selects/filtres)
  private _categories = signal<Category[]>([]);
  categories = this._categories.asReadonly();

  // ─── Lecture publique ────────────────────────────────────────

  /**
   * GET /api/resources/categories  (ou route dédiée côté back)
   * Liste toutes les catégories — accessible publiquement
   * (pour les filtres de la page /resources)
   */
  getAll() {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`).pipe(
      tap(list => this._categories.set(list))
    );
  }

  /**
   * GET /api/categories/:id
   * Détail d'une catégorie
   */
  getOne(id: number) {
    return this.http.get<Category>(`${environment.apiUrl}/categories/${id}`);
  }

  // ─── CRUD Admin (ROLE_ADMIN requis) ─────────────────────────

  /**
   * GET /api/admin/categories
   * Liste toutes les catégories depuis le back-office
   */
  adminGetAll() {
    return this.http.get<Category[]>(this.ADMIN_API).pipe(
      tap(list => this._categories.set(list))
    );
  }

  /**
   * POST /api/admin/categories
   * Crée une nouvelle catégorie
   * Body : { name: string, description?: string }
   */
  create(data: { name: string; description?: string }) {
    return this.http.post<Category>(this.ADMIN_API, data).pipe(
      tap(created => this._categories.update(list => [...list, created]))
    );
  }

  /**
   * PUT /api/admin/categories/:id
   * Modifie une catégorie existante
   * Body : { name?: string, description?: string }
   */
  update(id: number, data: { name?: string; description?: string }) {
    return this.http.put<Category>(`${this.ADMIN_API}/${id}`, data).pipe(
      tap(updated =>
        this._categories.update(list =>
          list.map(c => (c.id === id ? updated : c))
        )
      )
    );
  }

  /**
   * DELETE /api/admin/categories/:id
   * Supprime une catégorie (ROLE_ADMIN requis)
   */
  delete(id: number) {
    return this.http.delete(`${this.ADMIN_API}/${id}`).pipe(
      tap(() =>
        this._categories.update(list => list.filter(c => c.id !== id))
      )
    );
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/admin`;

  // Ressources
  getResources()         { return this.http.get(`${this.API}/resources`); }
  deleteResource(id: number) { return this.http.delete(`${this.API}/resources/${id}`); }

  // Catégories
  getCategories()                      { return this.http.get(`${this.API}/categories`); }
  createCategory(data: any)            { return this.http.post(`${this.API}/categories`, data); }
  updateCategory(id: number, data: any){ return this.http.put(`${this.API}/categories/${id}`, data); }
  deleteCategory(id: number)           { return this.http.delete(`${this.API}/categories/${id}`); }

  // Utilisateurs
  getUsers()             { return this.http.get(`${this.API}/users`); }
  banUser(id: number)    { return this.http.put(`${this.API}/users/${id}/ban`, {}); }
  deleteUser(id: number) { return this.http.delete(`${this.API}/users/${id}`); }

  // Stats
  getStatistics()  { return this.http.get(`${this.API}/statistics`); }
  exportStats()    { return this.http.get(`${this.API}/statistics/export`); }
}
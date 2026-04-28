import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Resource, ResourceFilters } from '../models/resource.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/resources`;

  getAll(filters?: ResourceFilters) {
    let params = new HttpParams();
    if (filters?.type)       params = params.set('type', filters.type);
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.search)     params = params.set('search', filters.search);
    return this.http.get<Resource[]>(this.API, { params });
  }

  getOne(id: number)                    { return this.http.get<Resource>(`${this.API}/${id}`); }
  create(data: Partial<Resource>)       { return this.http.post<Resource>(this.API, data); }
  update(id: number, data: Partial<Resource>) { return this.http.put<Resource>(`${this.API}/${id}`, data); }
  delete(id: number)                    { return this.http.delete(`${this.API}/${id}`); }
}
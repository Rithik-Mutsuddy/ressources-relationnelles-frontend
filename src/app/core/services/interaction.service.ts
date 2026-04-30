import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InteractionType, ResourceInteraction } from '../models/interaction.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/resources`;

  getByResource(resourceId: number) {
    return this.http.get<ResourceInteraction[]>(`${this.API}/${resourceId}/interactions`);
  }

  getFavorites() {
    return this.http.get<any[]>(`${this.API}/favorites`);
  }

  getAsides() {
    return this.http.get<any[]>(`${this.API}/favorites/aside`);
  }

  getPending() {
    return this.http.get<any[]>(`${this.API}/pending`);
  }

   getDraft() {
    return this.http.get<any[]>(`${this.API}/draft`);
  }

  interact(resourceId: number, type: InteractionType) {
    return this.http.post<ResourceInteraction>(`${this.API}/${resourceId}/interactions`, { type });
  }

  remove(resourceId: number, type: InteractionType) {
    return this.http.delete(`${this.API}/${resourceId}/interactions/${type}`);
  }
}
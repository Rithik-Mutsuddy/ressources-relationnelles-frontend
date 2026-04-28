import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InteractionType, ResourceInteraction } from '../models/interaction.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/resources`;

  getByResource(resourceId: number) {
    return this.http.get<ResourceInteraction[]>(`${this.API}/${resourceId}/interactions`);
  }

  interact(resourceId: number, type: InteractionType) {
    return this.http.post<ResourceInteraction>(`${this.API}/${resourceId}/interactions`, { type });
  }

  remove(resourceId: number, type: InteractionType) {
    return this.http.delete(`${this.API}/${resourceId}/interactions/${type}`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class ModeratorService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/moderator`;

  getPendingResources()            { return this.http.get(`${this.API}/resources/pending`); }
  validateResource(id: number)     { return this.http.put(`${this.API}/resources/${id}/validate`, {}); }
  rejectResource(id: number)       { return this.http.put(`${this.API}/resources/${id}/reject`, {}); }
  getReportedComments()            { return this.http.get(`${this.API}/comments/reported`); }
  deleteComment(id: number)        { return this.http.delete(`${this.API}/comments/${id}`); }
  replyComment(id: number, content: string) {
    return this.http.post(`${this.API}/comments/${id}/reply`, { content });
  }
}
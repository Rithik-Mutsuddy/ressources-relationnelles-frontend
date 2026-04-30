import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../models/comment.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/resources`;
  private API_MODERATOR = `${environment.apiUrl}/moderator`;

  getByResource(resourceId: number) {
    return this.http.get<Comment[]>(`${this.API}/${resourceId}/comments`);
  }

  create(resourceId: number, content: string) {
    return this.http.post<Comment>(`${this.API}/${resourceId}/comments`, { content });
  }

  reply(resourceId: number, commentId: number, content: string) {
    return this.http.post<Comment>(
      `${this.API}/${resourceId}/comments/${commentId}/reply`, { content }
    );
  }

  getReported() {
    return this.http.get<any[]>(`${this.API_MODERATOR}/reported`);
  }

  // ✅ Valider commentaire
  validateComment(id: number) {
    return this.http.post(`${this.API_MODERATOR}/${id}/validate`, {});
  }

  // ❌ Rejeter commentaire
  rejectComment(id: number) {
    return this.http.post(`${this.API_MODERATOR}/${id}/reject`, {});
  }

  report(commentId: number, resourceId: number) {
    return this.http.post(
      `${this.API}/${resourceId}/comments/${commentId}/report`,
      {}
    );
  }
}
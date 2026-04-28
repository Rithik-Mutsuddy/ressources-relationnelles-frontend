import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../models/comment.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/resources`;

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
}
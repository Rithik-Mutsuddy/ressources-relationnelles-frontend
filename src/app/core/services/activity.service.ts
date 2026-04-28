import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Activity } from '../models/activity.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/activities`;

  // State local — liste des activités en cache
  private _activities = signal<Activity[]>([]);
  activities = this._activities.asReadonly();

  // ─── Lecture ────────────────────────────────────────────────

  /**
   * GET /api/activities
   * Récupère toutes les activités disponibles (ROLE_USER requis)
   */
  getAll() {
    return this.http.get<Activity[]>(this.API).pipe(
      tap(list => this._activities.set(list))
    );
  }

  /**
   * GET /api/activities/:id
   * Récupère le détail d'une activité
   */
  getOne(id: number) {
    return this.http.get<Activity>(`${this.API}/${id}`);
  }

  // ─── Actions ────────────────────────────────────────────────

  /**
   * POST /api/activities/:id/start
   * Démarre une activité pour l'utilisateur connecté
   * Retourne un objet { message, activity }
   */
  start(id: number) {
    return this.http.post<{ message: string; activity: Pick<Activity, 'id' | 'name'> }>(
      `${this.API}/${id}/start`,
      {}
    );
  }

  /**
   * POST /api/activities/:id/invite
   * Invite un ou plusieurs participants à une activité
   * Body : { user_ids: number[] }
   */
  invite(activityId: number, userIds: number[]) {
    return this.http.post<{ message: string }>(
      `${this.API}/${activityId}/invite`,
      { user_ids: userIds }
    );
  }
}
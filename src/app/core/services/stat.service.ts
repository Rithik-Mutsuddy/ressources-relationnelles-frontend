import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRole } from '../models/user.model';
import { environment } from '../../../environnement/environment';
import { PlatformStatistics } from '../models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}`;

 getStats() { return this.http.get<PlatformStatistics>(`${this.API}/stats`); }
}
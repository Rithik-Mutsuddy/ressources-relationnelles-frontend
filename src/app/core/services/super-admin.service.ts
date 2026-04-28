import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRole } from '../models/user.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private http = inject(HttpClient);
  private API  = `${environment.apiUrl}/superadmin`;

  getAccounts()                       { return this.http.get(`${this.API}/accounts`); }
  createAccount(data: any)            { return this.http.post(`${this.API}/accounts`, data); }
  changeRole(id: number, role: UserRole) {
    return this.http.put(`${this.API}/accounts/${id}/role`, { role });
  }
  deleteAccount(id: number)           { return this.http.delete(`${this.API}/accounts/${id}`); }
}
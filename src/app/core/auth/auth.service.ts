import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environnement/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http      = inject(HttpClient);
  private router    = inject(Router);
  private tokenSvc  = inject(TokenService);

  private readonly API = `${environment.apiUrl}/auth`;

  // Signal du user courant (null = non connecté)
  currentUser = signal<User | null>(this.tokenSvc.getStoredUser());

  // Computed helpers
  isAuthenticated = computed(() => this.currentUser() !== null);

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  isModerator    = computed(() => this.hasRole('ROLE_MODERATOR'));
  isAdmin        = computed(() => this.hasRole('ROLE_ADMIN'));
  isSuperAdmin   = computed(() => this.hasRole('ROLE_SUPER_ADMIN'));

  // --- Auth maison ---

  register(data: { email: string; password: string; firstname: string; lastname: string }) {
    return this.http.post(`${this.API}/register`, data);
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  refresh() {
    const token = this.tokenSvc.getRefreshToken();
    return this.http.post<{ access_token: string }>(`${this.API}/refresh`, {
      refresh_token: token
    }).pipe(
      tap(res => this.tokenSvc.setAccessToken(res.access_token))
    );
  }

  logout() {
    const refreshToken = this.tokenSvc.getRefreshToken();
    this.http.post(`${this.API}/logout`, { refresh_token: refreshToken }).subscribe();
    this.clearSession();
    this.router.navigate(['/']);
  }

  // --- FranceConnect ---

  getFranceConnectUrl() {
    return this.http.get<{ url: string; state: string; nonce: string }>(
      `${this.API}/france-connect`
    );
  }

  handleFranceConnectCallback(code: string, state: string, originalState: string) {
    return this.http.get<AuthResponse>(
      `${this.API}/france-connect/callback?code=${code}&state=${state}`,
      { headers: { 'X-FC-State': originalState } }
    ).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  getFranceConnectLogoutUrl(fcIdToken: string) {
    return this.http.post<{ url: string }>(
      `${this.API}/france-connect/logout`,
      { fc_id_token: fcIdToken }
    );
  }

  // --- Privé ---

  private handleAuthSuccess(res: AuthResponse) {
    this.tokenSvc.setTokens(res.access_token, res.refresh_token);
    this.tokenSvc.setStoredUser(res.user);
    this.currentUser.set(res.user);
  }

  private clearSession() {
    this.tokenSvc.clear();
    this.currentUser.set(null);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { AuthResponse } from '../models/user.model';
import { environment } from '../../../environnement/environment';

const FC_STATE_KEY = 'fc_state';
const FC_NONCE_KEY = 'fc_nonce';
const FC_ID_TOKEN  = 'fc_id_token';

@Injectable({ providedIn: 'root' })
export class FranceConnectService {
  private http      = inject(HttpClient);
  private router    = inject(Router);
  private tokenSvc  = inject(TokenService);

  private readonly API = `${environment.apiUrl}/auth/france-connect`;

  // ─── Étape 1 : initier la connexion ─────────────────────────

  /**
   * Appelle GET /api/auth/france-connect
   * Stocke le state (anti-CSRF) et le nonce en sessionStorage
   * Puis redirige le navigateur vers l'URL FranceConnect
   */
  initiateLogin(): void {
    this.http
      .get<{ url: string; state: string; nonce: string }>(this.API)
      .subscribe({
        next: ({ url, state, nonce }) => {
          // Stockage sécurisé du state pour vérification CSRF au retour
          sessionStorage.setItem(FC_STATE_KEY, state);
          sessionStorage.setItem(FC_NONCE_KEY, nonce);

          // Redirection complète du navigateur vers FranceConnect
          window.location.href = url;
        },
        error: err => {
          console.error('Erreur FranceConnect redirect:', err);
        }
      });
  }

  // ─── Étape 2 : traiter le callback ──────────────────────────

  /**
   * Appelé par FranceConnectCallbackComponent
   * Récupère code + state depuis l'URL, envoie au backend
   * Retourne l'Observable<AuthResponse> pour que le composant puisse réagir
   */
  handleCallback(code: string, state: string) {
    const expectedState = sessionStorage.getItem(FC_STATE_KEY) ?? '';

    // Nettoyage immédiat du state (usage unique)
    sessionStorage.removeItem(FC_STATE_KEY);
    sessionStorage.removeItem(FC_NONCE_KEY);

    return this.http.get<AuthResponse>(
      `${this.API}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      { headers: { 'X-FC-State': expectedState } }
    ).pipe(
      tap(res => {
        // Stockage des tokens JWT applicatifs
        this.tokenSvc.setTokens(res.access_token, res.refresh_token);
        this.tokenSvc.setStoredUser(res.user);

        // Stockage du id_token FC pour la déconnexion propre
        if (res.fc_id_token) {
          sessionStorage.setItem(FC_ID_TOKEN, res.fc_id_token);
        }
      })
    );
  }

  // ─── Étape 3 : déconnexion propre de FranceConnect ──────────

  /**
   * POST /api/auth/france-connect/logout
   * Récupère l'URL de logout FC et redirige le navigateur
   * (obligatoire pour respecter le protocole OIDC de FC)
   */
  logout(): void {
    const fcIdToken = sessionStorage.getItem(FC_ID_TOKEN);

    if (!fcIdToken) {
      // Pas de session FC → simple navigation
      this.router.navigate(['/']);
      return;
    }

    this.http
      .post<{ url: string }>(`${this.API}/logout`, { fc_id_token: fcIdToken })
      .subscribe({
        next: ({ url }) => {
          sessionStorage.removeItem(FC_ID_TOKEN);
          // Redirection vers FranceConnect pour déconnexion officielle
          window.location.href = url;
        },
        error: () => {
          // En cas d'erreur, on déconnecte localement quand même
          sessionStorage.removeItem(FC_ID_TOKEN);
          this.router.navigate(['/']);
        }
      });
  }

  // ─── Helpers ────────────────────────────────────────────────

  /**
   * Vérifie si l'utilisateur courant est connecté via FranceConnect
   * (utile pour savoir si on doit appeler logout FC ou pas)
   */
  isFranceConnectUser(): boolean {
    const user = this.tokenSvc.getStoredUser();
    return user?.authProvider === 'france_connect';
  }

  /**
   * Récupère le fc_id_token stocké (pour usage externe si besoin)
   */
  getFcIdToken(): string | null {
    return sessionStorage.getItem(FC_ID_TOKEN);
  }
}